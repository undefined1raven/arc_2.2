import { useNewUserData } from "@/stores/newUserData";
import * as SQLite from "expo-sqlite";
import { v4 } from "uuid";
import * as Crypto from "expo-crypto";
import { getLocalCache } from "../localDb";
import { saveNewDeviceInfo } from "../newAccountInit/saveNewDeviceInfo";
async function saveNewUser(PIKBackup: string) {
  console.log("------------SAVING NEW USER", Date.now());

  const newUserDataApi = useNewUserData.getState();
  const newUserData = newUserDataApi.userData;
  const db = await getLocalCache();

  if (newUserData === null) {
    throw new Error("Null new user data");
  }

  const accountId = newUserData.id;
  const deviceId = newUserDataApi.newDeviceId;
  const private_key_backup = newUserData.PSKBackup;

  if (
    typeof private_key_backup !== "string" ||
    typeof deviceId !== "string" ||
    typeof accountId !== "string"
  ) {
    throw new Error("Invalid new device info or account id");
  }

  await saveNewDeviceInfo({
    account_id: accountId,
    device_id: deviceId,
    private_key_backup: private_key_backup,
  });

  async function getFeatureConfigChunk(
    encryptedContent: string,
    type: "timeTracking" | "personalDiary" | "dayPlanner",
  ) {
    const encryptedContentHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      encryptedContent,
    );

    return {
      id: `FC-${v4()}`,
      userID: newUserData?.id,
      encryptedContent: encryptedContent,
      tx: Date.now(),
      type: type,
      version: "0.1.2",
      hash: encryptedContentHash,
    };
  }

  const timeTrackingFCChunk = await getFeatureConfigChunk(
    newUserData?.timeTrackingFeatureConfig ?? "",
    "timeTracking",
  );
  const personalDiaryFCChunk = await getFeatureConfigChunk(
    newUserData?.diaryFeatureConfig ?? "",
    "personalDiary",
  );
  const dayPlannerFCChunk = await getFeatureConfigChunk(
    newUserData?.dayPlannerFeatureConfig ?? "",
    "dayPlanner",
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
        `INSERT INTO featureConfigChunks (id, userID, encryptedContent, tx, type, version, hash) VALUES (${"?, ".repeat(
          6,
        )} ?);`,
        Object.values(chunk),
      )
      .catch((e) => {
        console.log(`Error savings FC CHUnks: `, e);
      });
    newFCChunksSaveToDBPromises.push(savePromise);
  });

  await Promise.allSettled(newFCChunksSaveToDBPromises);

  return db.runAsync(
    `INSERT INTO users (id, signupTime, PIKBackup, PSKBackup, RCKBackup, version) VALUES (${"?, ".repeat(
      5,
    )} ?);`,
    [
      newUserData?.id ?? null,
      newUserData?.signupTime ?? null,
      PIKBackup ?? null,
      newUserData?.PSKBackup ?? null,
      newUserData?.RCKBackup ?? null,
      newUserData?.version ?? null,
    ],
  );
}

export { saveNewUser };
