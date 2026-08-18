import {
  deviceId as deviceIdSecureStoreKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import { useActiveKeys } from "@/stores/decryptedKeys";
import * as SecureStore from "expo-secure-store";
import * as crypto from "expo-crypto";

export async function createDpopProof(
  method: string,
  url: string,
  accessToken?: string,
) {
  const activePrivateKey = useActiveKeys((keys) => keys.activePrivateKey);
  if (activePrivateKey === null) {
    console.error("Failed to get private key [KL-343]");
    return { status: "error", error: "No Private Key Found" };
  }

  let devicePublicKey: null | object = null;
  try {
    const devicePublicKeyString = await SecureStore.getItemAsync(
      secureStoreKeyNames.userPublicKey,
    );
    if (devicePublicKeyString === null) {
      console.error("No device public key found");
      return { status: "error", error: "No device public key found" };
    }
    devicePublicKey = JSON.parse(devicePublicKeyString);
  } catch (e) {
    console.error("Failed to parse device public key. [TKR-34]");
    return {
      status: "error",
      error: "Failed to parse device public key. [TKR-34]",
    };
  }

  const deviceId = await SecureStore.getItemAsync(deviceIdSecureStoreKey);
  if (deviceId === null) {
    console.error("Device ID missing: ", deviceId);
    return {
      status: "error",
      error: "Device ID missing [TKR-188]",
    };
  }
  const jti = crypto.randomUUID();
  const iat = Math.floor(Date.now() / 1000);
}
