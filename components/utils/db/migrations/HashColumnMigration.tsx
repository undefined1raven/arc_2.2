import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import * as Crypto from "expo-crypto";
function HashColumnMigration() {
  const db = useSQLiteContext();
  useEffect(() => {
    async function genHashesForTable(tableName: string) {
      const affectedRows = await db.getAllAsync(
        `SELECT id, hash, encryptedContent, tx FROM ${tableName} WHERE hash IS NULL`
      );

      if (affectedRows.length === 0) {
        return;
      }

      for (let ix = 0; ix < affectedRows.length; ix++) {
        const ec = affectedRows[ix].encryptedContent;
        const cid = affectedRows[ix].id;
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          ec
        );
        await db.runAsync(`UPDATE ${tableName} SET hash = ? WHERE id = ?`, [
          hash,
          cid,
        ]);
      }
    }
    genHashesForTable("timeTrackingChunks");
    genHashesForTable("dayPlannerChunks");
    genHashesForTable("personalDiaryChunks");
    genHashesForTable("personalDiaryGroups");
  }, []);

  return null;
}

export { HashColumnMigration };
