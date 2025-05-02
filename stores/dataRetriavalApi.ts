import { create } from "zustand";
import { v4 } from "uuid";
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import { ARC_ChunksType } from "@/constants/CommonTypes";
import { useActiveUser } from "./activeUser";
import { useCryptoOpsQueue } from "./cryptoOpsQueue";
type TableNames =
  | "timeTrackingChunks"
  | "dayPlannerChunks"
  | "personalDiaryChunks";

interface DataRetrivalApi {
  appendEntry: (tableName: TableNames, rowData: any) => void;
}

const DataRetrivalApi = create<DataRetrivalApi>((set, get) => ({
  appendEntry: async (tableName, rowData) => {
    const activeUserId = useActiveUser.getState().activeUser.userId as
      | string
      | null;
    const cryptoOpsApi = useCryptoOpsQueue.getState();
    const allowedTableNames = [
      "timeTrackingChunks",
      "dayPlannerChunks",
      "personalDiaryChunks",
    ];
    if (activeUserId === null) {
      return { status: "error", error: "No active user" };
    }
    if (allowedTableNames.includes(tableName) === false) {
      return { status: "error", error: "Invalid table name" };
    }
    const db = await SQLite.openDatabaseAsync("localCache");
    const latestChunk: ARC_ChunksType | null = await db.getFirstAsync(
      `SELECT * FROM ${tableName} WHERE userID = ? ORDER BY tx DESC LIMIT 1`,
      [activeUserId]
    );
    if (latestChunk === null) {
      return { status: "error", error: "No chunks found" };
    }
    if (typeof latestChunk.encryptedContent !== "string") {
      return { status: "error", error: "Invalid chunk data" };
    }
    const key = await SecureStore.getItemAsync(
      secureStoreKeyNames.accountConfig.activePrivateKey
    );
    if (key === null) {
      return { status: "error", error: "No key found" };
    }
    const decryptionResults = await cryptoOpsApi.performOperation("decrypt", {
      keyType: "symmetric",
      charCodeData: latestChunk.encryptedContent,
      key: key,
    });
    if (decryptionResults.status === "error") {
      return { status: "error", error: decryptionResults.payload };
    }
    ////TO DO
  },
}));
