import { create } from "zustand";
import { v4 } from "uuid";
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import { ARC_ChunksType } from "@/constants/CommonTypes";
import { useActiveUser } from "./activeUser";
import { useCryptoOpsQueue } from "./cryptoOpsQueue";
import {
  charCodeArrayToString,
  stringToCharCodeArray,
} from "@/components/utils/fn/charOps";
import { chunkPrefixes } from "@/constants/chunkPrefixes";
import { useStatusIndicatorStore } from "./statusIndicatorStore";
type TableNames =
  | "timeTrackingChunks"
  | "dayPlannerChunks"
  | "personalDiaryChunks"
  | "personalDiaryGroups";

interface DataRetrivalApi {
  appendEntry: (
    tableName: TableNames,
    rowData: any,
    chunkSize: number
  ) => Promise<{
    status: "error" | "success";
    payload?: any;
    error?: string;
  }>;
  getDataInTimeRange: (
    tableName: TableNames,
    from?: number | null | undefined,
    until?: number | null | undefined,
    chunkLimit?: number | null | undefined
  ) => Promise<{
    status: "error" | "success";
    payload?: any[];
    error?: string;
  }>;
}

const allowedTableNames = [
  "timeTrackingChunks",
  "dayPlannerChunks",
  "personalDiaryChunks",
  "personalDiaryGroups",
];

const dataRetrivalApi = create<DataRetrivalApi>((set, get) => ({
  appendEntry: async (tableName, rowData, chunkSize): Promise<any> => {
    const statusIndicatorApi = useStatusIndicatorStore.getState();
    const activeUserId = useActiveUser.getState().activeUser.userId as
      | string
      | null;
    const cryptoOpsApi = useCryptoOpsQueue.getState();

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
      secureStoreKeyNames.accountConfig.activeSymmetricKey
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

    function updateChunk(newChunk: ARC_ChunksType) {
      return db
        .runAsync(
          `UPDATE ${tableName} SET encryptedContent = ?, tx = ? WHERE userID = ? AND id = ?`,
          [newChunk.encryptedContent, newChunk.tx, activeUserId, newChunk.id]
        )
        .then((result) => {
          statusIndicatorApi.setIsSavingLocalData(false);
          db.closeAsync();
          return { status: "success", payload: result };
        })
        .catch((e) => {
          db.closeAsync();
          return { status: "error", error: e };
        });
    }

    function insertChunk(newChunk: ARC_ChunksType) {
      return db
        .runAsync(
          `INSERT INTO ${tableName} (id, encryptedContent, userID, tx, version) VALUES (${"?, ".repeat(
            4
          )} ?);`,
          Object.values(newChunk)
        )
        .then((result) => {
          statusIndicatorApi.setIsSavingLocalData(false);
          return { status: "success", payload: result };
        })
        .catch((e) => {
          return { status: "error", error: e };
        });
    }
    statusIndicatorApi.setIsSavingLocalData(true);
    try {
      const decryptedStringData = charCodeArrayToString(
        JSON.parse("[" + decryptionResults.payload.decrypted + "]")
      );
      try {
        const parsedData = JSON.parse(decryptedStringData) as any[];
        if (parsedData === null) {
          return { status: "error", error: "Parsed data is null" };
        }

        if (typeof parsedData.length !== "number") {
          return { status: "error", error: "Parsed data is not an array" };
        }

        if (parsedData.length + 1 > chunkSize) {
          const newData = [rowData];
          const encryptionResults = await cryptoOpsApi.performOperation(
            "encrypt",
            {
              keyType: "symmetric",
              key: key,
              charCodeData: stringToCharCodeArray(JSON.stringify(newData)),
            }
          );
          if (encryptionResults.status === "error") {
            return { status: "error", error: encryptionResults.payload };
          }
          const encryptedContent = {
            cipher: encryptionResults.payload.cipher,
            iv: encryptionResults.payload.iv,
          };

          const chunkIDPrefix = chunkPrefixes[tableName];

          const newChunk = {
            id: `${chunkIDPrefix}${v4()}`,
            encryptedContent: JSON.stringify(encryptedContent),
            userID: activeUserId,
            tx: Date.now(),
            version: "0.1.0",
          };

          return insertChunk(newChunk);
        } else {
          const appendedData = [...parsedData, rowData];
          const encryptionResults = await cryptoOpsApi.performOperation(
            "encrypt",
            {
              keyType: "symmetric",
              key: key,
              charCodeData: stringToCharCodeArray(JSON.stringify(appendedData)),
            }
          );
          if (encryptionResults.status === "error") {
            return { status: "error", error: encryptionResults.payload };
          }
          const encryptedContent = {
            cipher: encryptionResults.payload.cipher,
            iv: encryptionResults.payload.iv,
          };

          const previousContentLength = latestChunk.encryptedContent.length;

          const updatedChunk = {
            ...latestChunk,
            encryptedContent: JSON.stringify(encryptedContent),
          };

          const newContentLength = updatedChunk.encryptedContent.length;

          if (newContentLength <= previousContentLength) {
            return {
              status: "error",
              error: "Content length is not increasing",
            };
          }

          return updateChunk(updatedChunk);
        }
      } catch (e) {
        return { status: "error", error: "Failed to parse decrypted data" };
      }
    } catch (e) {
      return {
        status: "error",
        error: "Failed to parse encoded decrypted data",
      };
    }
  },
  getDataInTimeRange: async (
    tableName,
    from,
    until,
    chunkLimit
  ): Promise<{
    status: "error" | "success";
    payload?: any[];
    error?: string;
  }> => {
    const activeUserId = useActiveUser.getState().activeUser.userId as
      | string
      | null;
    const cryptoOpsApi = useCryptoOpsQueue.getState();

    if (activeUserId === null) {
      return { status: "error", error: "No active user" };
    }
    if (allowedTableNames.includes(tableName) === false) {
      return { status: "error", error: "Invalid table name" };
    }

    const key = await SecureStore.getItemAsync(
      secureStoreKeyNames.accountConfig.activeSymmetricKey
    );
    if (key === null) {
      return { status: "error", error: "No key found" };
    }

    const db = await SQLite.openDatabaseAsync("localCache");

    let txQuery = "tx > 0";
    if (typeof from === "number") {
      txQuery = `tx >= ${from}`;
    }
    if (typeof until === "number") {
      txQuery += ` AND tx <= ${until}`;
    }

    let parsedChunkLimit = "";
    if (typeof chunkLimit === "number") {
      parsedChunkLimit = `LIMIT ${chunkLimit}`;
    }
    const relevantChunks: ARC_ChunksType[] = await db.getAllAsync(
      `SELECT * FROM ${tableName} WHERE userID = ? AND ${txQuery} ORDER BY tx DESC ${parsedChunkLimit}`,
      [activeUserId]
    );

    const decryptionPromises = relevantChunks.map((chunk) => {
      const encryptedContent = chunk.encryptedContent;
      const decryptionPromise = cryptoOpsApi.performOperation("decrypt", {
        keyType: "symmetric",
        charCodeData: encryptedContent,
        key: key,
      });
      return decryptionPromise;
    });

    return Promise.all(decryptionPromises)
      .then((decryptionResults) => {
        let data: any[] = [];
        decryptionResults.map((result, index) => {
          if (result.status === "error") {
            return null;
          }
          const decryptedEncodedStringData =
            "[" + result.payload.decrypted + "]";
          const encodedArray = JSON.parse(
            decryptedEncodedStringData
          ) as number[];
          const decodedStringData = charCodeArrayToString(encodedArray);
          const parsedData = JSON.parse(decodedStringData) as any[];
          data = [...data, ...parsedData];
        });
        return { status: "success", payload: data };
      })
      .catch((e) => {
        console.log("Decryption error", e);
        return { status: "error", error: e };
      });
  },
}));

export { dataRetrivalApi };
