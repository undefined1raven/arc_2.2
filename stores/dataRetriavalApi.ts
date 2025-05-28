import { create } from "zustand";
import { v4 } from "uuid";
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import {
  ARC_ChunksType,
  FeatureConfigChunkType,
} from "@/constants/CommonTypes";
import { useActiveUser } from "./activeUser";
import { useCryptoOpsQueue } from "./cryptoOpsQueue";
import {
  charCodeArrayToString,
  stringToCharCodeArray,
} from "@/components/utils/fn/charOps";
import { chunkPrefixes } from "@/constants/chunkPrefixes";
import { useStatusIndicatorStore } from "./statusIndicatorStore";
import { getValueByKeys } from "@/components/utils/fn/geetValueByKeys";
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
  modifyEntry: (
    tableName: TableNames,
    keyPath: string[],
    valueToMatch: string,
    newValue: any,
    chunkID?: string | undefined | null,
    replaceOrAppend?: "replace" | "append" | "delete"
  ) => Promise<{
    status: "error" | "success";
    payload?: any;
    error?: string | "Match not found";
  }>;
  modifyFeatureConfig: (
    featureConfigType: "dayPlanner" | "timeTracking" | "personalDiary",
    keyPath: string[],
    valueToMatch: string,
    newValue: any,
    replaceOrAppend?: "replace" | "append" | "delete"
  ) => Promise<{
    status: "error" | "success";
    payload?: any;
    error?: string | "Match not found";
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
  modifyEntry: async (
    tableName: TableNames,
    keyPath: string[],
    valueToMatch: string,
    newValue: any,
    chunkID?: string | undefined | null,
    replaceOrAppend?: "replace" | "append" | "delete"
  ) => {
    let replaceOrAppendValue = "replace";
    if (
      replaceOrAppend === "append" ||
      replaceOrAppend === "replace" ||
      replaceOrAppend === "delete"
    ) {
      replaceOrAppendValue = replaceOrAppend;
    }
    if (Array.isArray(keyPath) === false || keyPath.length === 0) {
      return { status: "error", error: "Invalid keyPath" };
    }
    if (valueToMatch === null || valueToMatch === undefined) {
      return { status: "error", error: "Invalid valueToMatch" };
    }
    if (newValue === null || newValue === undefined) {
      return { status: "error", error: "Invalid newValue" };
    }
    const activeUserId = useActiveUser.getState().activeUser.userId as
      | string
      | null;

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
    const cryptoOpsApi = useCryptoOpsQueue.getState();
    const statusIndicatorApi = useStatusIndicatorStore.getState();
    const db = await SQLite.openDatabaseAsync("localCache");
    statusIndicatorApi.setIsSavingLocalData(true);
    ////If no chunkID is provided, get the latest chunk
    const hasChunkId = typeof chunkID === "string" && chunkID.length > 0;
    const argList: string[] = [activeUserId];
    if (hasChunkId) {
      argList.push(chunkID);
    }

    const encryptedChunk: ARC_ChunksType | FeatureConfigChunkType | null =
      await db.getFirstAsync(
        `SELECT * FROM ${tableName} WHERE userID = ? ${
          hasChunkId ? "AND id = ?" : "ORDER BY tx DESC LIMIT 1"
        } `,
        argList
      );

    if (encryptedChunk === null) {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: "No chunks found" };
    }

    const encryptedContent = encryptedChunk.encryptedContent;
    if (typeof encryptedContent !== "string") {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: "Invalid chunk data" };
    }
    const decryptionResults = await cryptoOpsApi.performOperation("decrypt", {
      keyType: "symmetric",
      charCodeData: encryptedContent,
      key: key,
    });

    if (decryptionResults.status === "error") {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: decryptionResults.payload };
    }

    try {
      const decodedStringData = charCodeArrayToString(
        JSON.parse("[" + decryptionResults.payload.decrypted + "]")
      );
      const parsedData = JSON.parse(decodedStringData) as any[];
      const dataMatchIndex = parsedData.findIndex((item) => {
        const value = getValueByKeys(item, keyPath);
        if (typeof value === null || typeof value === "undefined") {
          return false;
        }
        if (value === valueToMatch) {
          return true;
        }
      });
      if (dataMatchIndex === -1) {
        statusIndicatorApi.setIsSavingLocalData(false);
        return { status: "error", error: "Match not found" };
      }
      const newData = [...parsedData];
      if (replaceOrAppendValue === "replace") {
        newData[dataMatchIndex] = newValue;
      } else if (replaceOrAppendValue === "append") {
        newData[dataMatchIndex] = {
          ...newData[dataMatchIndex],
          ...newValue,
        };
      } else if (replaceOrAppendValue === "delete") {
        newData.splice(dataMatchIndex, 1);
      }
      if (newData.length !== parsedData.length) {
        statusIndicatorApi.setIsSavingLocalData(false);
        return { status: "error", error: "Data length mismatch" };
      }
      const encryptionResults = await cryptoOpsApi.performOperation("encrypt", {
        keyType: "symmetric",
        key: key,
        charCodeData: stringToCharCodeArray(JSON.stringify(newData)),
      });
      if (encryptionResults.status === "error") {
        statusIndicatorApi.setIsSavingLocalData(false);
        return { status: "error", error: encryptionResults.payload };
      }
      const encryptedContent = {
        cipher: encryptionResults.payload.cipher,
        iv: encryptionResults.payload.iv,
      };
      const updatedChunk = {
        ...encryptedChunk,
        encryptedContent: JSON.stringify(encryptedContent),
      };
      const savePromise = db.runAsync(
        `UPDATE ${tableName} SET encryptedContent = ? WHERE userID = ? AND id = ?`,
        [updatedChunk.encryptedContent, activeUserId, updatedChunk.id]
      );
      return savePromise
        .then((result) => {
          statusIndicatorApi.setIsSavingLocalData(false);
          db.closeAsync();
          return { status: "success" };
        })
        .catch((e) => {
          statusIndicatorApi.setIsSavingLocalData(false);
          db.closeAsync();
          return { status: "error", error: e };
        });
    } catch (e) {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: "Failed to parse decrypted data" };
    }
  },
  modifyFeatureConfig: async (
    featureConfigType: "dayPlanner" | "timeTracking" | "personalDiary",
    keyPath: string[],
    valueToMatch: string,
    newValue: any,
    replaceOrAppend?: "replace" | "append" | "delete"
  ) => {
    const allowedFeatureConfigTypes = [
      "dayPlanner",
      "timeTracking",
      "personalDiary",
    ];
    let replaceOrAppendValue = "replace";
    if (
      replaceOrAppend === "append" ||
      replaceOrAppend === "replace" ||
      replaceOrAppend === "delete"
    ) {
      replaceOrAppendValue = replaceOrAppend;
    }
    if (Array.isArray(keyPath) === false || keyPath.length === 0) {
      return { status: "error", error: "Invalid keyPath" };
    }
    if (valueToMatch === null || valueToMatch === undefined) {
      return { status: "error", error: "Invalid valueToMatch" };
    }
    if (newValue === null || newValue === undefined) {
      return { status: "error", error: "Invalid newValue" };
    }
    const activeUserId = useActiveUser.getState().activeUser.userId as
      | string
      | null;

    if (activeUserId === null) {
      return { status: "error", error: "No active user" };
    }
    if (allowedFeatureConfigTypes.includes(featureConfigType) === false) {
      return { status: "error", error: "Invalid table name" };
    }

    const key = await SecureStore.getItemAsync(
      secureStoreKeyNames.accountConfig.activeSymmetricKey
    );
    if (key === null) {
      return { status: "error", error: "No key found" };
    }
    const cryptoOpsApi = useCryptoOpsQueue.getState();
    const statusIndicatorApi = useStatusIndicatorStore.getState();
    const db = await SQLite.openDatabaseAsync("localCache");
    statusIndicatorApi.setIsSavingLocalData(true);
    ////If no chunkID is provided, get the latest chunk
    const argList: string[] = [activeUserId];
    const encryptedChunk: ARC_ChunksType | FeatureConfigChunkType | null =
      await db.getFirstAsync(
        `SELECT * FROM featureConfigChunks WHERE userID = ? AND type = "${featureConfigType}" ORDER BY tx DESC LIMIT 1`,
        argList
      );

    if (encryptedChunk === null) {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: "No chunks found" };
    }

    const encryptedContent = encryptedChunk.encryptedContent;
    if (typeof encryptedContent !== "string") {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: "Invalid chunk data" };
    }
    const decryptionResults = await cryptoOpsApi.performOperation("decrypt", {
      keyType: "symmetric",
      charCodeData: encryptedContent,
      key: key,
    });

    if (decryptionResults.status === "error") {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: decryptionResults.payload };
    }

    try {
      const decodedStringData = charCodeArrayToString(
        JSON.parse("[" + decryptionResults.payload.decrypted + "]")
      );
      const parsedData = JSON.parse(decodedStringData) as any[];
      const dataMatchIndex = parsedData.findIndex((item) => {
        const value = getValueByKeys(item, keyPath);
        if (typeof value === null || typeof value === "undefined") {
          return false;
        }
        if (value === valueToMatch) {
          return true;
        }
      });
      if (dataMatchIndex === -1) {
        statusIndicatorApi.setIsSavingLocalData(false);
        return { status: "error", error: "Match not found" };
      }
      const newData = [...parsedData];
      if (replaceOrAppendValue === "replace") {
        newData[dataMatchIndex] = newValue;
      } else if (replaceOrAppendValue === "append") {
        newData[dataMatchIndex] = {
          ...newData[dataMatchIndex],
          ...newValue,
        };
      } else if (replaceOrAppendValue === "delete") {
        newData.splice(dataMatchIndex, 1);
      }
      if (newData.length !== parsedData.length) {
        statusIndicatorApi.setIsSavingLocalData(false);
        return { status: "error", error: "Data length mismatch" };
      }
      const encryptionResults = await cryptoOpsApi.performOperation("encrypt", {
        keyType: "symmetric",
        key: key,
        charCodeData: stringToCharCodeArray(JSON.stringify(newData)),
      });
      if (encryptionResults.status === "error") {
        statusIndicatorApi.setIsSavingLocalData(false);
        return { status: "error", error: encryptionResults.payload };
      }
      const encryptedContent = {
        cipher: encryptionResults.payload.cipher,
        iv: encryptionResults.payload.iv,
      };
      const updatedChunk = {
        ...encryptedChunk,
        encryptedContent: JSON.stringify(encryptedContent),
      };
      const savePromise = db.runAsync(
        `UPDATE featureConfigChunks SET encryptedContent = ? WHERE userID = ? AND id = ?`,
        [updatedChunk.encryptedContent, activeUserId, updatedChunk.id]
      );
      return savePromise
        .then((result) => {
          statusIndicatorApi.setIsSavingLocalData(false);
          db.closeAsync();
          return { status: "success" };
        })
        .catch((e) => {
          statusIndicatorApi.setIsSavingLocalData(false);
          db.closeAsync();
          return { status: "error", error: e };
        });
    } catch (e) {
      statusIndicatorApi.setIsSavingLocalData(false);
      return { status: "error", error: "Failed to parse decrypted data" };
    }
  },
}));

export { dataRetrivalApi };
