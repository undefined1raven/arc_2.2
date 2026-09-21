import * as SecureStore from "expo-secure-store";
import {
  getPrivateKey,
  getSymmetricKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { saveNewUser } from "@/components/utils/db/saveNewUser";
import { encodeWrappedSymkey } from "@/components/utils/encoding/wrappedSymkey";
import { reloadAsync } from "expo-updates";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { createEmptyChunks } from "@/components/utils/newAccountInit/createEmptyChunks";
import { saveSecretKeyOnDevice } from "@/components/utils/newAccountInit/saveSecretKeyOnDevice";
import { useNewUserData } from "@/stores/newUserData";
import { API_URL } from "@/constants/API_URL";
import { DeviceType } from "@/constants/CommonTypes";

async function sendAccountInfoToBackend(wrappedSymKey: string) {
  const newUserDataApi = useNewUserData.getState();
  const newUserPayload = { ...newUserDataApi.userData } as any;
  delete newUserPayload?.dayPlannerFeatureConfig;
  delete newUserPayload?.diaryFeatureConfig;
  delete newUserPayload?.timeTrackingFeatureConfig;
  newUserPayload["PIKBackup"] = wrappedSymKey;

  const deviceId = newUserDataApi.deviceData?.device_id;
  const deviceCreatedAt = newUserDataApi.deviceData?.created_at;
  const accountId = newUserDataApi.userData?.id;
  const devicePubKey = newUserDataApi.deviceData?.device_public_key;
  const devicePrivateKeyBackup = newUserDataApi.deviceData?.private_key_backup;
  const deviceName = newUserDataApi.deviceData?.device_name;
  if (
    typeof deviceId !== "string" ||
    accountId === undefined ||
    typeof devicePubKey !== "string" ||
    typeof devicePrivateKeyBackup !== "string" ||
    typeof deviceCreatedAt !== "number" ||
    typeof deviceName !== "string"
  ) {
    return { error: "Failed to get new account info", status: "error" };
  }

  const newDevicePayload: DeviceType = {
    device_id: deviceId,
    private_key_backup: devicePrivateKeyBackup,
    device_public_key: devicePubKey,
    created_at: deviceCreatedAt,
    account_id: accountId,
    device_name: deviceName,
    last_seen: deviceCreatedAt,
  };

  ///Send user info to backend
  return fetch(`${API_URL}/users/new`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userPayload: newUserPayload,
      devicePayload: newDevicePayload,
    }),
  })
    .then(async (r) => {
      if (r.ok) {
        return { status: "success" };
      } else {
        return { status: "error", error: r.statusText };
      }
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
}

async function finishAccountCreation() {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const newUserDataApi = useNewUserData.getState();
  const userId = newUserDataApi.userData?.id;
  if (typeof userId !== "string") {
    return;
  }

  const activeKeysAPI = useActiveKeys.getState();
  const symmetricKeyJwk = activeKeysAPI.activeSymmetricKey;
  const privateKeyJwk = activeKeysAPI.activePrivateKey;

  if (
    typeof symmetricKeyJwk !== "string" ||
    typeof privateKeyJwk !== "string"
  ) {
    return;
  }

  if (typeof newUserDataApi.newPIN !== "string") {
    return;
  }

  await createEmptyChunks(symmetricKeyJwk, userId);

  const symKeyWrapRes = await cryptoOpsApi.performOperation("wrapKey", {
    password: newUserDataApi.newPIN + newUserDataApi.secretKey,
    jwkKeyData: symmetricKeyJwk,
    keyType: "symmetric",
  });

  if (symKeyWrapRes.status === "error") {
    console.error("Failed to wrap sym key");
    return;
  }

  const armoredPrivateKey = newUserDataApi?.userData?.PSKBackup || null;

  async function basicSecureStoreSave(userId: string) {
    if (typeof privateKeyJwk !== "string") {
      return;
    }

    const wrappedSymKey = encodeWrappedSymkey(symKeyWrapRes.payload);
    if (wrappedSymKey === null) {
      console.error("Error encoding wrapped symmetric key");
      return;
    }

    if (typeof newUserDataApi.deviceData?.device_public_key !== "string") {
      console.error("Device public key not found");
      return;
    }

    if (typeof newUserDataApi.userData?.publicKey !== "string") {
      return;
    }

    console.log("Saving new user with wrapped symmetric key");
    await SecureStore.setItemAsync(getSymmetricKey(userId), wrappedSymKey);

    if (armoredPrivateKey === null) {
      return;
    }

    await SecureStore.setItemAsync(getPrivateKey(userId), armoredPrivateKey);

    await SecureStore.setItemAsync(
      secureStoreKeyNames.accountConfig.useBiometricAuth,
      "false",
    );

    await SecureStore.setItemAsync(
      secureStoreKeyNames.userPublicKey,
      newUserDataApi.userData?.publicKey,
    );

    const accountSaveRes = await sendAccountInfoToBackend(wrappedSymKey);
    console.log("DEVIEC ACC SAVE", accountSaveRes);

    if (accountSaveRes.status !== "success") {
      console.error("Account Creation API call fail");
      return;
    }

    ///Redirect to home
    saveNewUser(wrappedSymKey)
      .then(() => {
        console.log("Saved new user");
        reloadAsync();
      })
      .catch((e) => {
        console.error("Error saving new user", e);
      });
  }

  if (typeof newUserDataApi.secretKey !== "string") {
    console.error("Private key missing in new user data ");
    return;
  }

  if (newUserDataApi.useBiometricAuth === false) {
    await saveSecretKeyOnDevice(newUserDataApi.secretKey);
    basicSecureStoreSave(userId);
  } else {
    if (armoredPrivateKey === null) {
      return;
    }
    await SecureStore.setItemAsync(getPrivateKey(userId), armoredPrivateKey);
    await saveSecretKeyOnDevice(newUserDataApi.secretKey);

    const wrappedSymKey = encodeWrappedSymkey(symKeyWrapRes.payload);
    if (wrappedSymKey === null) {
      console.error("Error encoding wrapped symmetric key");
      return;
    }

    if (typeof newUserDataApi.userData?.publicKey !== "string") {
      return;
    }

    await SecureStore.setItemAsync(
      secureStoreKeyNames.userPublicKey,
      newUserDataApi.userData?.publicKey,
    );

    SecureStore.setItemAsync(getSymmetricKey(userId), wrappedSymKey)
      .then(async () => {
        if (typeof newUserDataApi.newPIN !== "string") {
          return;
        }

        const accountSaveRes = await sendAccountInfoToBackend(wrappedSymKey);
        console.log("ASR 2", accountSaveRes);

        if (accountSaveRes.status !== "success") {
          console.error("Account Creation API call fail");
          return;
        }

        ///Redirect to home
        await SecureStore.setItemAsync(
          secureStoreKeyNames.accountConfig.useBiometricAuth,
          "true",
        );
        await SecureStore.setItemAsync(
          secureStoreKeyNames.accountConfig.pin,
          newUserDataApi.newPIN + newUserDataApi.secretKey,
          {
            requireAuthentication: true,
            authenticationPrompt:
              "Authenticate to use your screen lock to unlock",
          },
        );
        saveNewUser(wrappedSymKey)
          .then(() => {
            console.log("Saved new user");
            reloadAsync();
          })
          .catch((e) => {
            console.log("Error saving new user", e);
          });
      })
      .catch(async (err) => {
        basicSecureStoreSave(userId);
      });
  }
}

export { finishAccountCreation };
