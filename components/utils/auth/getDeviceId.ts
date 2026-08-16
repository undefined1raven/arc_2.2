import * as SecureStore from "expo-secure-store";
import { deviceId } from "../constants/secureStoreKeyNames";
import * as Crypto from "expo-crypto";
function getDeviceId(): string | null {
  const currentDeviceId = SecureStore.getItem(deviceId);
  return currentDeviceId;
}

async function checkAndSetDeviceId(): Promise<
  string | { error: string; status: "error" }
> {
  const currentDeviceId = await SecureStore.getItemAsync(deviceId);

  if (currentDeviceId === null || typeof currentDeviceId !== "string") {
    const newDeviceId = Crypto.randomUUID();
    console.log("Creating new device id");
    return SecureStore.setItemAsync(deviceId, `ADI-${newDeviceId}`)
      .then((r) => {
        return newDeviceId;
      })
      .catch((e) => {
        return { error: `Failed to save device ID: ${e}`, status: "error" };
      });
  } else {
    return currentDeviceId;
  }
}

async function deleteDeviceId() {
  await SecureStore.deleteItemAsync(deviceId);
}

export { getDeviceId, checkAndSetDeviceId, deleteDeviceId };
