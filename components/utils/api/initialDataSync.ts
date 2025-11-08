import { useActiveUser } from "@/stores/activeUser";
import * as SecureStore from "expo-secure-store";
import { deviceId } from "../constants/secureStoreKeyNames";
import { authenticatedApiRequest } from "./apiRequest";
import * as SQLite from "expo-sqlite";

async function getLocalMetadata() {
  const db = await SQLite.openDatabaseAsync("localCache");

  const timeTrackingMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id FROM timeTrackingChunks"
  );
  const dayPlannerMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id FROM dayPlannerChunks"
  );
  const personalDiaryMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id FROM personalDiaryChunks"
  );
  const personalDiaryGroupsMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id FROM personalDiaryGroups"
  );
  const featureConfigMetadataPromise = db.getAllAsync(
    "SELECT hash, tx, id FROM featureConfigChunks"
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

  console.log(JSON.stringify(promiseValues));
}

async function initialDataSync() {
  const activeUserId = useActiveUser.getState().activeUser.userId;
  const currentDeviceId = SecureStore.getItem(deviceId);

  getLocalMetadata();

  authenticatedApiRequest("/dataSync/requestMetadata", {
    deviceId: currentDeviceId,
    accountId: activeUserId,
  })
    .then((v) => {
      console.log(v.data);
    })
    .catch((e) => {
      console.log("error", e);
    });
}

export { initialDataSync };
