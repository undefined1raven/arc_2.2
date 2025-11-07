import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import {
  deviceId,
  secureStoreKeyNames,
} from "../constants/secureStoreKeyNames";
import { useActiveUser } from "@/stores/activeUser";
import { checkAndSetDeviceId, deleteDeviceId } from "../auth/getDeviceId";
export type CheckTablesReturnSig = {
  status: "failed" | "success";
  error: null | string;
  isEmpty?: boolean;
  userId?: string;
  accountType: "local" | "online" | null;
};

async function checkTablesActual(): Promise<CheckTablesReturnSig> {
  const db = await SQLite.openDatabaseAsync("localCache");
  var promiseArray: Promise<any>[] = [];
  const usersTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS users (id TEXT NOT NULL PRIMARY KEY, signupTime NUMBER NOT NULL, publicKey TEXT NOT NULL, passwordHash TEXT, emailAddress TEXT, passkeys TEXT, PIKBackup TEXT, PSKBackup TEXT, RCKBackup TEXT, trustedDevices TEXT, oauthState TEXT, securityLogs TEXT, version TEXT NOT NULL, accountType TEXT);"
  );
  promiseArray.push(usersTablePromise);
  const userDataTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS userData (userID TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, version TEXT NOT NULL, PRIMARY KEY (userID, key));"
  );
  promiseArray.push(userDataTablePromise);

  //Time tracking chunks
  const arcChunksTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS timeTrackingChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, timeRangeStart NUMBER, timeRangeEnd NUMBER, hash TEXT);"
  );
  promiseArray.push(arcChunksTablePromise);
  const arcChunksDerivedDataTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS timeTrackingDerivedDataChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, generationConfigSignature TEXT NOT NULL);"
  );
  promiseArray.push(arcChunksDerivedDataTablePromise);

  //Day planner chunks
  const tessChunksTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS dayPlannerChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, timeRangeStart NUMBER, timeRangeEnd NUMBER, hash TEXT);"
  );
  promiseArray.push(tessChunksTablePromise);
  const tessChunksDerivedDataTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS dayPlannerDerivedDataChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, generationConfigSignature TEXT NOT NULL);"
  );
  promiseArray.push(tessChunksDerivedDataTablePromise);

  //Personal Diary chunks
  const SIDChunksTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS personalDiaryChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, hash TEXT);"
  );
  const sidChunksDerivedDataTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS personalDiaryDerivedDataChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, generationConfigSignature TEXT NOT NULL);"
  );
  promiseArray.push(sidChunksDerivedDataTablePromise);
  promiseArray.push(SIDChunksTablePromise);
  const SIDGruopsChunksTablePromise = db.runAsync(
    "CREATE TABLE IF NOT EXISTS personalDiaryGroups (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, version TEXT NOT NULL, hash TEXT);"
  );
  promiseArray.push(SIDGruopsChunksTablePromise);

  ////Feature config tables
  const featureConfigChunks = db.runAsync(
    "CREATE TABLE IF NOT EXISTS featureConfigChunks (id TEXT NOT NULL PRIMARY KEY, userID TEXT NOT NULL, encryptedContent TEXT NOT NULL, tx NUMBER NOT NULL, type TEXT NOT NULL, version TEXT NOT NULL, hash TEXT);"
  );
  promiseArray.push(featureConfigChunks);

  return Promise.all(promiseArray)
    .then(() => {
      return db
        .getFirstAsync("SELECT * FROM users;")
        .then(async (firstUser: any) => {
          const isEmpty = firstUser === null;
          const userId = firstUser?.id;
          const accountType: "local" | "online" | null =
            firstUser?.accountType ?? "local";
          const currentDeviceId = await SecureStore.getItemAsync(deviceId);
          if (currentDeviceId === null || typeof currentDeviceId !== "string") {
            const newDeviceId = Crypto.randomUUID();
            await SecureStore.setItemAsync(deviceId, `ADI-${newDeviceId}`);
          }
          return {
            status: "success",
            error: null,
            isEmpty: isEmpty,
            userId: userId,
            accountType: accountType,
          };
        })
        .catch((e) => {
          throw e;
        });
    })
    .catch((e) => {
      throw e;
    });
}

async function NukeLocalData() {
  const db = await SQLite.openDatabaseAsync("localCache");
  const userId = useActiveUser.getState().activeUser.userId;
  db.runAsync("DROP TABLE users");
  db.runAsync("DROP TABLE userData");
  db.runAsync("DROP TABLE timeTrackingChunks");
  db.runAsync("DROP TABLE timeTrackingDerivedDataChunks");
  db.runAsync("DROP TABLE dayPlannerDerivedDataChunks");
  db.runAsync("DROP TABLE personalDiaryDerivedDataChunks");
  db.runAsync("DROP TABLE dayPlannerChunks");
  db.runAsync("DROP TABLE personalDiaryChunks");
  db.runAsync("DROP TABLE personalDiaryGroups");
  db.runAsync("DROP TABLE featureConfigChunks");
  SecureStore.deleteItemAsync(
    secureStoreKeyNames.accountConfig.activePrivateKey
  );
  SecureStore.deleteItemAsync(
    secureStoreKeyNames.accountConfig.activeSymmetricKey
  );
  AsyncStorage.removeItem(`${userId}-habitCardData`);
  SecureStore.deleteItemAsync(secureStoreKeyNames.temporary.privateKey);
  SecureStore.deleteItemAsync(secureStoreKeyNames.temporary.symmetricKey);
  SecureStore.deleteItemAsync(secureStoreKeyNames.accountConfig.pin);
  SecureStore.deleteItemAsync(
    secureStoreKeyNames.accountConfig.useBiometricAuth
  );
  await deleteDeviceId();
}

async function checkTables(): Promise<CheckTablesReturnSig> {
  // NukeLocalData();

  return checkTablesActual() //do some manual recursion since for some reason creating the tables doens't work the first time (after a fresh install)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return checkTablesActual()
        .then((res) => {
          return res;
        })
        .catch((e) => {
          return { status: "failed", error: e };
        });
    });
}

export { checkTables, NukeLocalData };
