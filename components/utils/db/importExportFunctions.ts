import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { useActiveUser } from "@/stores/activeUser";

export const DatabaseBackupApi = {
  getDatabasePath: async (): Promise<string> => {
    return FileSystem.documentDirectory + "SQLite/localCache";
  },

  // Simple export - no additional encryption needed
  exportDatabase: async (): Promise<{
    status: "success" | "error";
    message: string;
  }> => {
    try {
      const dbPath = await DatabaseBackupApi.getDatabasePath();
      const userId = useActiveUser.getState().activeUser?.userId;
      if (!userId) {
        return { status: "error", message: "User not authenticated" };
      }
      const dbInfo = await FileSystem.getInfoAsync(dbPath);

      if (!dbInfo.exists) {
        return { status: "error", message: "Database file not found" };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFilename = `arc-backup-${timestamp}-${userId}.db`;
      const tempBackupPath = `${FileSystem.cacheDirectory}${backupFilename}`;

      // Direct copy - data is already encrypted
      await FileSystem.copyAsync({
        from: dbPath,
        to: tempBackupPath,
      });

      //   // Share the encrypted database file
      //   await Sharing.shareAsync(tempBackupPath, {
      //     mimeType: "application/x-sqlite3",
      //     dialogTitle: "Save Encrypted Database Backup",
      //     UTI: "public.database",
      //   });

      // Save to device's Downloads folder or Documents
      const downloadsPath = `${FileSystem.documentDirectory}../Downloads/${backupFilename}`;
      const documentsPath = `${FileSystem.documentDirectory}${backupFilename}`;

      try {
        // Try Downloads folder first
        await FileSystem.copyAsync({
          from: tempBackupPath,
          to: downloadsPath,
        });
      } catch {
        // Fallback to Documents folder
        await FileSystem.copyAsync({
          from: tempBackupPath,
          to: documentsPath,
        });
      }

      // Cleanup
      await FileSystem.deleteAsync(tempBackupPath, { idempotent: true });

      return {
        status: "success",
        message: "Encrypted database exported successfully",
      };
    } catch (error) {
      console.error("Export error:", error);
      return { status: "error", message: `Export failed: ${error.message}` };
    }
  },

  // Simple import - encrypted data stays encrypted
  importDatabase: async (): Promise<{
    status: "success" | "error";
    message: string;
  }> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/x-sqlite3", "application/octet-stream", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { status: "error", message: "Import cancelled" };
      }

      const selectedFile = result.assets[0];
      const dbPath = await DatabaseBackupApi.getDatabasePath();

      // Create safety backup of current database
      const safetyBackupPath = `${
        FileSystem.documentDirectory
      }safety-backup-${Date.now()}.db`;
      await FileSystem.copyAsync({
        from: dbPath,
        to: safetyBackupPath,
      });

      // Replace with imported database (encrypted data)
      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: dbPath,
      });

      return {
        status: "success",
        message:
          "Encrypted database imported successfully. Restart the app to see changes.",
      };
    } catch (error) {
      console.error("Import error:", error);
      return { status: "error", message: `Import failed: ${error.message}` };
    }
  },

  // Quick backup to app documents (for local safety)
  createLocalBackup: async (): Promise<{
    status: "success" | "error";
    message: string;
    path?: string;
  }> => {
    try {
      const dbPath = await DatabaseBackupApi.getDatabasePath();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = `${FileSystem.documentDirectory}local-backup-${timestamp}.db`;

      await FileSystem.copyAsync({
        from: dbPath,
        to: backupPath,
      });

      return {
        status: "success",
        message: "Local backup created",
        path: backupPath,
      };
    } catch (error) {
      return {
        status: "error",
        message: `Local backup failed: ${error.message}`,
      };
    }
  },

  // List local backups
  getLocalBackups: async (): Promise<string[]> => {
    try {
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );
      return files
        .filter(
          (file) =>
            file.startsWith("local-backup-") ||
            file.startsWith("arc-backup-") ||
            file.startsWith("safety-backup-")
        )
        .sort()
        .reverse(); // Most recent first
    } catch (error) {
      console.error("Error listing backups:", error);
      return [];
    }
  },

  // Delete old local backups (keep only last N)
  cleanupOldBackups: async (keepCount: number = 5): Promise<void> => {
    try {
      const backups = await DatabaseBackupApi.getLocalBackups();
      const toDelete = backups.slice(keepCount);

      for (const backup of toDelete) {
        await FileSystem.deleteAsync(
          `${FileSystem.documentDirectory}${backup}`,
          { idempotent: true }
        );
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  },
};
