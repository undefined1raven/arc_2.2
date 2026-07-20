import * as SecureStore from "expo-secure-store";
import { noBioSKName } from "../constants/secureStoreKeyNames";
async function saveSecretKeyOnDevice(secretKey: string) {
  if (typeof secretKey !== "string") {
    return;
  }
  await SecureStore.setItemAsync(noBioSKName, secretKey);
}

export { saveSecretKeyOnDevice };
