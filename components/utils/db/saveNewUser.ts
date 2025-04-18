import { useNewUserData } from "@/stores/newUserData";
import * as SQLite from "expo-sqlite";
async function saveNewUser(PIKBackup: string) {
  const newUserDataApi = useNewUserData.getState();
  const newUserData = newUserDataApi.userData;
  console.log(
    "---------------------Saving new user data Pik",
    PIKBackup ?? null
  );
  const db = await SQLite.openDatabaseAsync("localCache");
  return db.runAsync(
    `INSERT INTO users (id, signupTime, publicKey, passwordHash, emailAddress, passkeys, PIKBackup, PSKBackup, RCKBackup, trustedDevices, oauthState, securityLogs, timeTrackingFeatureConfig, diaryFeatureConfig, dayPlannerFeatureConfig, version) VALUES (${"?, ".repeat(
      15
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
      newUserData?.timeTrackingFeatureConfig ?? null,
      newUserData?.diaryFeatureConfig ?? null,
      newUserData?.dayPlannerFeatureConfig ?? null,
      newUserData?.version ?? null,
    ]
  );
}

export { saveNewUser };
