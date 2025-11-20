import { useActiveUser } from "@/stores/activeUser";
import * as SecureStore from "expo-secure-store";
import { deviceId } from "../constants/secureStoreKeyNames";
import { authenticatedApiRequest } from "./apiRequest";
import * as SQLite from "expo-sqlite";
import { TransferTask, useTransferStore } from "@/stores/dataSyncApi";

type MetadataType = {
  hash: string;
  tx: number;
  id: string;
};

type ChunkMetadataResult = {
  metadata?: MetadataType[];
  error?: any;
  tableName: string;
};

async function getLocalMetadata(): Promise<ChunkMetadataResult[]> {
  const db = await SQLite.openDatabaseAsync("localCache");

  const timeTrackingMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version, timeRangeStart, timeRangeEnd FROM timeTrackingChunks"
  );
  const dayPlannerMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version, timeRangeStart, timeRangeEnd FROM dayPlannerChunks"
  );
  const personalDiaryMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version FROM personalDiaryChunks"
  );
  const personalDiaryGroupsMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version FROM personalDiaryGroups"
  );
  const featureConfigMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version FROM featureConfigChunks"
  );

  const promiseResults = await Promise.allSettled([
    timeTrackingMetadataPromise,
    dayPlannerMetadataPromise,
    personalDiaryMetadataPromise,
    personalDiaryGroupsMetadataPromise,
    featureConfigMetadataPromise,
  ]);

  const tableNameMap = {
    0: "timeTrackingChunks",
    1: "dayPlannerChunks",
    2: "personalDiaryChunks",
    3: "personalDiaryGroups",
    4: "featureConfigChunks",
  };

  const promiseValues = promiseResults.map((result, index) => {
    //@ts-ignore
    const tableName = tableNameMap[index];
    if (result.status === "fulfilled") {
      return { metadata: result.value, tableName: tableName };
    } else {
      console.error("Error fetching metadata:", result.reason);
      return { error: result.reason, tableName: tableName };
    }
  });

  return promiseValues;
}

function getMetadataDeltaForSync(
  localMetadata: MetadataType[],
  remoteMetadata: MetadataType[]
): {
  toUpload: MetadataType[];
  toDownload: MetadataType[];
} {
  const toUpload: MetadataType[] = [];
  const toDownload: MetadataType[] = [];

  ///1. Get local chunks not present remotely
  const remoteHashSet = new Set(remoteMetadata.map((item) => item.hash));
  for (const localItem of localMetadata) {
    if (!remoteHashSet.has(localItem.hash)) {
      toUpload.push(localItem);
    }
  }

  //2. Get remote chunks not present locally
  const localHashSet = new Set(localMetadata.map((item) => item.hash));
  for (const remoteItem of remoteMetadata) {
    if (!localHashSet.has(remoteItem.hash)) {
      toDownload.push(remoteItem);
    }
  }

  //3. Handle conflicting hashes based on tx
  const remoteMap = new Map(remoteMetadata.map((item) => [item.hash, item]));
  for (const localItem of localMetadata) {
    if (remoteMap.has(localItem.hash)) {
      const remoteItem = remoteMap.get(localItem.hash)!;
      if (localItem.tx > remoteItem.tx) {
        toUpload.push(localItem);
      } else if (localItem.tx < remoteItem.tx) {
        toDownload.push(remoteItem);
      }
    }
  }

  return { toUpload, toDownload };
}

async function initialDataSync() {
  const activeUserId = useActiveUser.getState().activeUser.userId;
  const currentDeviceId = SecureStore.getItem(deviceId);
  console.log("Starting initial data sync... 1");
  const localMetadataPromsie = getLocalMetadata();
  const remoteMetadataPromise = authenticatedApiRequest(
    "/dataSync/requestMetadata",
    {
      deviceId: currentDeviceId,
      accountId: activeUserId,
    }
  );

  Promise.all([localMetadataPromsie, remoteMetadataPromise])
    .then(async (results) => {
      const localMetadataResult: ChunkMetadataResult[] = results[0];
      const remoteMetadataFetchResult = results[1].data;

      if (
        remoteMetadataFetchResult.error !== null ||
        remoteMetadataFetchResult.status !== "success" ||
        remoteMetadataFetchResult.data === undefined
      ) {
        console.error(
          "Error fetching remote metadata:",
          remoteMetadataFetchResult?.error
        );
        return;
      }

      if (localMetadataResult.some((r) => r.error !== undefined)) {
        console.error("Error fetching local metadata:");
        return;
      }

      const remoteMetadataResult =
        remoteMetadataFetchResult.data as ChunkMetadataResult[];

      const uploads: Partial<TransferTask>[] = [];
      const downloads: Partial<TransferTask>[] = [];

      ///Loop over the metadata from each table
      for (let ix = 0; ix < 5; ix++) {
        let { toUpload, toDownload } = getMetadataDeltaForSync(
          localMetadataResult[ix].metadata || [],
          remoteMetadataResult[ix].metadata || []
        );

        //@ts-ignore
        toUpload = toUpload.map((item) => ({
          type: "upload",
          payload: {
            ...item,
            tableName: localMetadataResult[ix].tableName,
          },
        }));

        //@ts-ignore
        toDownload = toDownload.map((item) => ({
          type: "download",
          payload: {
            ...item,
            tableName: localMetadataResult[ix].tableName,
          },
        }));

        uploads.push(...toUpload);
        downloads.push(...toDownload);
      }

      ///Queue download ops
      const dataSyncApi = useTransferStore.getState();

      downloads.forEach((item) => dataSyncApi.enqueue(item as TransferTask));

      const db = await SQLite.openDatabaseAsync("localCache");
      const localDataRetrievalPromises = uploads.map(async (item) => {
        return db.getAllAsync(
          `SELECT encryptedContent FROM ${item.payload.tableName} WHERE id = ?`,
          [item.payload.id]
        );
      });

      Promise.all(localDataRetrievalPromises).then((localDataResults) => {
        const uploadPayloads = uploads.map((item, index) => ({
          ...item,
          payload: {
            ...item.payload,
            encryptedContent: localDataResults[index][0].encryptedContent,
          },
        }));

        uploadPayloads.forEach((item) =>
          dataSyncApi.enqueue(item as TransferTask)
        );
      });
    })
    .catch((e) => {
      console.error("Error during initial data sync:", e);
    });
}
export { initialDataSync };
