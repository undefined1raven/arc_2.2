import * as SecureStore from "expo-secure-store";
import { deviceId } from "../constants/secureStoreKeyNames";
import * as Crypto from "expo-crypto";
import { useActiveUser } from "@/stores/activeUser";
import { getLocalCache } from "../localDb";
import { DeviceType, LocalDeviceIdRow } from "@/constants/CommonTypes";

function generateNewDeviceId() {
  const newDeviceId = "ADI-" + Crypto.randomUUID();
  return newDeviceId;
}

async function getCurrentDeviceInfo(): Promise<null | DeviceType> {
  const activeUserId = useActiveUser.getState().activeUser.userId;
  if (typeof activeUserId !== "string") {
    console.error(
      JSON.stringify({
        status: "error",
        error: "Active user id not found",
      }),
    );
    return null;
  }
  const db = await getLocalCache();

  const deviceInfo: null | LocalDeviceIdRow = await db.getFirstAsync(
    `SELECT * FROM deviceIds WHERE account_id = ?`,
    [activeUserId],
  );

  if (deviceInfo === null) {
    console.error(
      JSON.stringify({
        status: "error",
        error: "Device id for active account not found",
      }),
    );
    return null;
  }

  return deviceInfo;
}

async function deleteDeviceId() {
  await SecureStore.deleteItemAsync(deviceId);
}

export { getCurrentDeviceInfo, deleteDeviceId, generateNewDeviceId };
