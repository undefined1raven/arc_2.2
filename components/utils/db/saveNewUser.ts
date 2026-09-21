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
  const deviceId = newUserDataApi.deviceData?.device_id;
  const device_private_key_backup =
    newUserDataApi.deviceData?.private_key_backup;

  if (
    typeof device_private_key_backup !== "string" ||
    typeof deviceId !== "string" ||
    typeof accountId !== "string"
  ) {
    throw new Error("Invalid new device info or account id");
  }

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

  try {
    await saveNewDeviceInfo();
  } catch (e) {
    console.error("Failed to save device info locally", e);
    throw new Error("Failed to save device info locally");
  }

  await db.runAsync(
    `INSERT INTO users (id, signupTime, PIKBackup, PSKBackup, RCKBackup, version, publicKey) VALUES (${"?, ".repeat(
      6,
    )} ?);`,
    [
      newUserData?.id ?? null,
      newUserData?.signupTime ?? null,
      PIKBackup ?? null,
      newUserData?.PSKBackup ?? null,
      newUserData?.RCKBackup ?? null,
      newUserData?.version ?? null,
      newUserData.publicKey ?? null,
    ],
  );

  return;
}

export { saveNewUser };
