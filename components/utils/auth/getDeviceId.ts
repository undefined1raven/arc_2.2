import * as SecureStore from "expo-secure-store";
import { deviceId } from "../constants/secureStoreKeyNames";
import * as Crypto from "expo-crypto";
function getDeviceId(): string | null {
  const currentDeviceId = SecureStore.getItem(deviceId);
  return currentDeviceId;
}

async function checkAndSetDeviceId() {
  const currentDeviceId = await SecureStore.getItemAsync(deviceId);

  if (currentDeviceId === null || typeof currentDeviceId !== "string") {
    const newDeviceId = Crypto.randomUUID();
    console.log("Creating new device id");
    await SecureStore.setItemAsync(deviceId, `ADI-${newDeviceId}`);
  }
}

async function deleteDeviceId() {
  await SecureStore.deleteItemAsync(deviceId);
}

export { getDeviceId, checkAndSetDeviceId, deleteDeviceId };
