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

  cryptoOpsApi
    .performOperation("wrapKey", {
      password: newUserDataApi.newPIN + newUserDataApi.secretKey,
      jwkKeyData: symmetricKeyJwk,
      keyType: "symmetric",
    })
    .then(async (res) => {
      const armoredPrivateKey = newUserDataApi?.userData?.PSKBackup || null;
      if (typeof armoredPrivateKey !== "string") {
        console.error("EPKM error");
        return;
      }

      if (res.status === "success") {
        async function basicSecureStoreSave(userId: string) {
          if (typeof privateKeyJwk !== "string") {
            return;
          }

          const wrappedSymKey = encodeWrappedSymkey(res.payload);
          if (wrappedSymKey === null) {
            console.error("Error encoding wrapped symmetric key");
            return;
          }
          console.log("Saving new user with wrapped symmetric key");
          await SecureStore.setItemAsync(
            getSymmetricKey(userId),
            wrappedSymKey,
          );

          await SecureStore.setItemAsync(
            getPrivateKey(userId),
            //@ts-expect-error
            armoredPrivateKey,
          );
          await SecureStore.setItemAsync(
            secureStoreKeyNames.accountConfig.useBiometricAuth,
            "false",
          );
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
          return;
        }
        if (newUserDataApi.useBiometricAuth === false) {
          await saveSecretKeyOnDevice(newUserDataApi.secretKey);
          basicSecureStoreSave(userId);
        } else {
          await SecureStore.setItemAsync(
            getPrivateKey(userId),
            armoredPrivateKey,
          );
          await saveSecretKeyOnDevice(newUserDataApi.secretKey);

          const wrappedSymKey = encodeWrappedSymkey(res.payload);
          if (wrappedSymKey === null) {
            console.error("Error encoding wrapped symmetric key");
            return;
          }
          await SecureStore.setItemAsync(getSymmetricKey(userId), wrappedSymKey)
            .then(async () => {
              if (typeof newUserDataApi.newPIN !== "string") {
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
    })
    .catch((err) => {
      console.error("Error wrapping symmetric key:", err);
    });
}

export { finishAccountCreation };
