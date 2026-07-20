import { useActiveUser } from "@/stores/activeUser";
import * as SecureStore from "expo-secure-store";
import { deviceId } from "../constants/secureStoreKeyNames";
import { authenticatedApiRequest } from "./apiRequest";
import * as SQLite from "expo-sqlite";
import { TransferTask, useTransferStore } from "@/stores/dataSyncApi";
import { getLocalCache } from "../localDb";

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
  const db = await getLocalCache();

  const timeTrackingMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version, timeRangeStart, timeRangeEnd FROM timeTrackingChunks WHERE LENGTH(encryptedContent) > 10",
  );
  const dayPlannerMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version, timeRangeStart, timeRangeEnd FROM dayPlannerChunks WHERE LENGTH(encryptedContent) > 10",
  );
  const personalDiaryMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version FROM personalDiaryChunks WHERE LENGTH(encryptedContent) > 10",
  );
  const personalDiaryGroupsMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version FROM personalDiaryGroups WHERE LENGTH(encryptedContent) > 10",
  );
  const featureConfigMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id, version, type FROM featureConfigChunks WHERE LENGTH(encryptedContent) > 10",
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
  remoteMetadata: MetadataType[],
  index: number,
): {
  toUpload: MetadataType[];
  toDownload: MetadataType[];
} {
  const toUpload: MetadataType[] = [];
  const toDownload: MetadataType[] = [];

  if (index === 0) {
    console.log("-------LOCAL", localMetadata);
    console.log("-------REMOTE", remoteMetadata);
  }

  ///1. Get local chunks not present remotely
  for (let ix = 0; ix < localMetadata.length; ix++) {
    const localItem = localMetadata[ix];
    const correspondingRemote = remoteMetadata.find(
      (r) => r.id === localItem.id,
    );

    if (correspondingRemote !== undefined) {
      continue;
    }
    toUpload.push(localItem);
  }

  //2. Get remote chunks not present locally
  for (let ix = 0; ix < remoteMetadata.length; ix++) {
    const remoteItem = remoteMetadata[ix];
    const correspondingLocal = localMetadata.find(
      (r) => r.id === remoteItem.id,
    );

    if (correspondingLocal !== undefined) {
      continue;
    }
    toDownload.push(remoteItem);
  }

  //3. Handle conflicting hashes based on tx
  const conflictedChunks = [];
  for (let ix = 0; ix < remoteMetadata.length; ix++) {
    const remoteItem = remoteMetadata[ix];
    const localItem = localMetadata.find((lm) => lm.id === remoteItem.id);
    if (!localItem) continue;
    if (localItem.hash !== remoteItem.hash) {
      conflictedChunks.push(remoteItem);
    }
  }
  for (let ix = 0; ix < conflictedChunks.length; ix++) {
    const remoteItem = conflictedChunks[ix];
    const localItem = localMetadata.find((lm) => lm.id === remoteItem.id);
    if (!localItem) continue;
    if (localItem.tx >= remoteItem.tx) {
      toUpload.push(localItem);
    } else if (remoteItem.tx > localItem.tx) {
      toDownload.push(remoteItem);
    }
  }

  return { toUpload, toDownload };
}

async function initialDataSync() {
  const activeUserId = useActiveUser.getState().activeUser.userId;
  const currentDeviceId = SecureStore.getItem(deviceId);
  console.log("Starting data sync...");
  const localMetadataPromsie = getLocalMetadata();
  const remoteMetadataPromise = authenticatedApiRequest(
    "/dataSync/requestMetadata",
    {
      deviceId: currentDeviceId,
      accountId: activeUserId,
    },
  );

  Promise.all([localMetadataPromsie, remoteMetadataPromise])
    .then(async (results) => {
      const localMetadataResult: ChunkMetadataResult[] = results[0];
      const remoteMetadataFetchResult = results[1];

      if (remoteMetadataFetchResult.error) {
        console.warn(
          "No remote metadata fetched:",
          remoteMetadataFetchResult.error,
        );
        return;
      }

      if (localMetadataResult.some((r) => r.error !== undefined)) {
        console.error("Error fetching local metadata:");
        return;
      }

      const remoteMetadataResult = remoteMetadataFetchResult?.data
        ?.data as ChunkMetadataResult[];

      const uploads: Partial<TransferTask>[] = [];
      const downloads: Partial<TransferTask>[] = [];

      console.log(
        "Local and remote metadata fetched, calculating deltas...",
        remoteMetadataResult,
      );

      ///Loop over the metadata from each table
      for (let ix = 0; ix < 5; ix++) {
        let { toUpload, toDownload } = getMetadataDeltaForSync(
          localMetadataResult[ix].metadata || [],
          remoteMetadataResult[ix].metadata || [],
          ix,
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

      console.info("Sync ops:", {
        downloads: downloads.length,
        uploads: uploads.length,
      });

      dataSyncApi.enqueue(
        downloads.map((r) => {
          return { ...r, downloadPayload: r.payload };
        }) as TransferTask[],
      );

      const db = await getLocalCache();
      const localDataRetrievalPromises = uploads.map(async (item) => {
        return db.getAllAsync(
          `SELECT encryptedContent FROM ${item.payload.tableName} WHERE id = ?`,
          [item.payload.id],
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

        ////LOCAL
        uploadPayloads.forEach((item) => {
          dataSyncApi.enqueue(item as TransferTask);
        });
      });
    })
    .catch((e) => {
      console.error("Error during initial data sync:", e);
    });
}
export { initialDataSync };
