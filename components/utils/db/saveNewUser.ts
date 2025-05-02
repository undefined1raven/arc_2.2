import { useNewUserData } from "@/stores/newUserData";
import * as SQLite from "expo-sqlite";
import { v4 } from "uuid";
async function saveNewUser(PIKBackup: string) {
  console.log("------------SAVING NEW USER", Date.now());

  const newUserDataApi = useNewUserData.getState();
  const newUserData = newUserDataApi.userData;
  const db = await SQLite.openDatabaseAsync("localCache");

  function getFeatureConfigChunk(
    encryptedContent: string,
    type: "timeTracking" | "personalDiary" | "dayPlanner"
  ) {
    return {
      id: `FC-${v4()}`,
      userID: newUserData?.id,
      encryptedContent: encryptedContent,
      tx: Date.now(),
      type: type,
      version: "0.1.0",
    };
  }

  const timeTrackingFCChunk = getFeatureConfigChunk(
    newUserData?.timeTrackingFeatureConfig ?? "",
    "timeTracking"
  );
  const personalDiaryFCChunk = getFeatureConfigChunk(
    newUserData?.diaryFeatureConfig ?? "",
    "personalDiary"
  );
  const dayPlannerFCChunk = getFeatureConfigChunk(
    newUserData?.dayPlannerFeatureConfig ?? "",
    "dayPlanner"
  );

  const newFCChunks = [
    timeTrackingFCChunk,
    personalDiaryFCChunk,
    dayPlannerFCChunk,
  ];

  const newFCChunksSaveToDBPromises: Promise<any>[] = [];
  newFCChunks.forEach((chunk) => {
    const savePromise = db
      .runAsync(
        `INSERT INTO featureConfigChunks (id, userID, encryptedContent, tx, type, version) VALUES (${"?, ".repeat(
          5
        )} ?);`,
        Object.values(chunk)
      )
      .catch((e) => {
        console.log(`Error savings FC CHUnks: `, e);
      });
    newFCChunksSaveToDBPromises.push(savePromise);
  });

  await Promise.allSettled(newFCChunksSaveToDBPromises);

  return db.runAsync(
    `INSERT INTO users (id, signupTime, publicKey, passwordHash, emailAddress, passkeys, PIKBackup, PSKBackup, RCKBackup, trustedDevices, oauthState, securityLogs, version) VALUES (${"?, ".repeat(
      12
    )} ?);`,
    [
      newUserData?.id ?? null,
      newUserData?.signupTime ?? null,
      newUserData?.publicKey ?? null,
      newUserData?.passwordHash ?? null,
      newUserData?.emailAddress ?? null,
      newUserData?.passkeys ?? null,
      PIKBackup ?? null,
      newUserData?.PSKBackup ?? null,
      newUserData?.RCKBackup ?? null,
      newUserData?.trustedDevices ?? null,
      newUserData?.oauthState ?? null,
      newUserData?.securityLogs ?? null,
      newUserData?.version ?? null,
    ]
  );
}

export { saveNewUser };
