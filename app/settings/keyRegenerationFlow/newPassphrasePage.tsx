import "react-native-get-random-values";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as Clipboard from "expo-clipboard";
import Text from "@/components/common/Text";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { DownloadDeco } from "@/components/deco/DownloadDeco";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { saveFile } from "@/components/utils/fn/saveFile";
import { CopyDeco } from "@/components/deco/CopyDeco";
import { useCallback } from "react";
import { useActiveUser } from "@/stores/activeUser";
import { keyRegenTempStore } from "@/stores/keyRegenTempStore";
import { useActiveKeys } from "@/stores/decryptedKeys";
import {
  getPrivateKey,
  getSymmetricKey,
  noBioSKName,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import { useSQLiteContext } from "expo-sqlite";
import { API_URL } from "@/constants/API_URL";
import { getDeviceId } from "@/components/utils/auth/getDeviceId";
import {
  basicSecureStoreSave,
  newKeyPair,
  updateSymKeyWrap,
} from "./keyRegenFunction";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const activeUserApi = useActiveUser((r) => r.activeUser);
  const db = useSQLiteContext();
  const symkey = useActiveKeys((state) => state.activeSymmetricKey);
  const newPassphrase = keyRegenTempStore((state) => state.newPassphrase);

  const localDBCommit = useCallback(
    async (
      encryptedPrivateKey: string,
      PIKBackup: string,
      RCKBackup: string,
      newPassphrase: string,
      newKeyWrapPassword: string,
      biometricAuth: boolean,
    ) => {
      const activeUserId = activeUserApi.userId;

      if (activeUserId === null) {
        return;
      }

      return db
        .runAsync(
          `UPDATE users SET PSKBackup = ?, PIKBackup = ?, RCKBackup = ? WHERE id = ?`,
          [encryptedPrivateKey, PIKBackup, RCKBackup, activeUserApi.userId],
        )
        .catch((e) => {
          console.error("Error updating key pair in DB:", e);
          return { status: "error", error: e };
        })
        .then(async () => {
          const userId = activeUserApi.userId;
          if (typeof userId !== "string") {
            console.error("User ID is not a string");
            return { status: "error", error: "UIDNS" };
          }
          await SecureStore.setItemAsync(
            getPrivateKey(userId),
            encryptedPrivateKey,
          );
          console.log("Key pair updated successfully");
          await SecureStore.setItemAsync(
            getSymmetricKey(activeUserId),
            PIKBackup,
          )
            .then(async () => {
              ///Restart app
              const secureStoreUpdatePromises = [];
              const updateNoBioPassphraseStorage = SecureStore.setItemAsync(
                noBioSKName,
                newPassphrase,
              );
              secureStoreUpdatePromises.push(updateNoBioPassphraseStorage);

              if (biometricAuth === true) {
                ///Only do full password save if the biometric auth is enabled
                const updateBioAuthSecureStoreKeyPromise =
                  SecureStore.setItemAsync(
                    secureStoreKeyNames.accountConfig.pin,
                    newKeyWrapPassword,
                    {
                      requireAuthentication: true,
                      authenticationPrompt:
                        "Authenticate to use your screen lock to unlock",
                    },
                  );
                secureStoreUpdatePromises.push(
                  updateBioAuthSecureStoreKeyPromise,
                );
              }
              Promise.all(secureStoreUpdatePromises)
                .then(() => {
                  Updates.reloadAsync();
                })
                .catch((err) => {
                  basicSecureStoreSave(activeUserId, PIKBackup);
                });
            })
            .catch(async (err) => {
              basicSecureStoreSave(activeUserId, PIKBackup);
            });
        });
    },
    [symkey, activeUserApi.userId],
  );

  const remoteDBCommit = useCallback(
    async (
      PIKBackup: string,
      RCKBackup: string,
      PSKBackup: string,
      publicKey: string,
    ) => {
      const deviceId = getDeviceId();
      if (deviceId === null) {
        return { status: "error", error: "Device ID missing" };
      }
      const deviceInfoUpdatePromise = fetch(
        `${API_URL}/devices/${deviceId}/update`,
        {
          body: JSON.stringify({ device_public_key: publicKey }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );

      const accountUpdatePayload = JSON.stringify({
        PIKBackup,
        RCKBackup,
        PSKBackup,
      });
      const accountUpdatePromise = fetch(
        `${API_URL}/users/${activeUserApi.userId}/update`,
        {
          body: accountUpdatePayload,
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );

      return Promise.allSettled([deviceInfoUpdatePromise, accountUpdatePromise])
        .then((res) => {
          if (res.some((r) => r.status !== "fulfilled")) {
            return { status: "error", error: "API Call failed" };
          } else {
            const deviceInfoRes = res[0].value;
            const accountInfoRes = res[1].value;

            if (deviceInfoRes.ok === false || accountInfoRes.ok === false) {
              return {
                status: "error",
                error: `deviceInfoRes: ${deviceInfoRes.ok} | accountInfoRes: ${accountInfoRes.ok}`,
              };
            } else {
              return { status: "success" };
            }
          }
        })
        .catch((e) => {
          return { status: "error", error: e };
        });
    },
    [activeUserApi.userId],
  );

  const regenerateKey = useCallback(async () => {
    const keyRegenTempStoreAPI = keyRegenTempStore.getState();
    const newPIN = keyRegenTempStoreAPI.pin;
    const activeUserId = activeUserApi.userId;
    const plainKey = symkey;

    if (
      activeUserId === null ||
      newPIN === null ||
      newPassphrase === null ||
      plainKey === null
    ) {
      return;
    }
    const newKeyWrapPassword = newPIN + newPassphrase;

    const hasBioAuth =
      (await SecureStore.getItemAsync(
        secureStoreKeyNames.accountConfig.useBiometricAuth,
      )) === "true";

    ///1. Get new key pair and replace the wrap on the sym key
    const newKeyPairRes = await newKeyPair(plainKey);
    const newSymKeyWrap = await updateSymKeyWrap(newKeyWrapPassword, plainKey);

    if (
      newKeyPairRes.status !== "success" ||
      newSymKeyWrap.status !== "success"
    ) {
      console.error("Failed to get updated key pair or sym key wrap");
      return;
    }

    const { wrappedSymKey } = newSymKeyWrap;
    const { encryptedPrivateKey, publicKey } = newKeyPairRes;
    const RCKBackup = keyRegenTempStoreAPI.newRCK;

    if (RCKBackup === null) {
      console.error("New RCK missing");
      return;
    }

    if (typeof encryptedPrivateKey !== "string") {
      return;
    }

    ///2. Commit changes to account and device info to the remote DB
    const remoteDBCommitRes = await remoteDBCommit(
      wrappedSymKey,
      RCKBackup,
      encryptedPrivateKey,
      publicKey,
    );

    if (remoteDBCommitRes.status === "error") {
      console.error("API Call failed to update account or device");
      return;
    }

    console.log("BIO AUTH", hasBioAuth);

    ///3. Commit changes to local DB and update secure store
    localDBCommit(
      encryptedPrivateKey,
      wrappedSymKey,
      RCKBackup,
      newPassphrase,
      newKeyWrapPassword,
      hasBioAuth,
    );
  }, [newPassphrase]);

  return (
    <>
      <ThemedView style={styles.container}>
        <Animated.View
          entering={FadeIn}
          style={{
            width: "100%",
            marginBottom: 20,
            height: 50,
          }}
        >
          <Text
            textAlign="left"
            label="Regenerate Key [3/3]"
            style={{
              height: "100%",
              width: "100%",
              marginBottom: 10,
            }}
            backgroundColor={globalStyle.color + "20"}
          ></Text>
        </Animated.View>
        <Animated.View
          entering={FadeIn}
          style={{
            width: "100%",
            marginBottom: 5,
            height: 50,
          }}
        >
          <Text
            textAlign="left"
            fontSize={globalStyle.veryLargeMobileFont}
            label="Secret Key"
            style={{
              height: "100%",
              width: "100%",
              marginBottom: 5,
              paddingLeft: 0,
            }}
          ></Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp}
          style={{ height: "60%", width: "100%" }}
        >
          <Text
            numberOfLines={10}
            fontSize={14}
            backgroundColor={globalStyle.color + "20"}
            style={{
              width: "100%",
              height: "auto",
              padding: 10,
              paddingRight: 15,
            }}
            label={newPassphrase ?? "..."}
            textAlign="left"
          ></Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown}
          style={{ height: "20%", width: "100%" }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: "35%",
              marginBottom: 10,
            }}
          >
            <Button
              onClick={() => {
                const fileName = `ARC-PK-${Date.now()}-${
                  activeUserApi.userId
                }.txt`;
                saveFile(fileName, newPassphrase ?? "...").then((res) => {
                  console.log("File saved", res);
                });
              }}
              textAlign="left"
              label="Download"
              style={{
                flex: 1,
                height: "100%",
                marginRight: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <DownloadDeco style={{ height: 45 }}></DownloadDeco>
            </Button>
            <Button
              onClick={() => {
                Clipboard.setStringAsync(newPassphrase ?? "...");
              }}
              textAlign="left"
              label=""
              style={{
                flex: 1,
                height: "100%",
                marginLeft: 5,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingRight: 5,
                paddingLeft: 5,
              }}
            >
              <Text label="Copy"></Text>
              <CopyDeco style={{ height: 45 }}></CopyDeco>
            </Button>
          </View>
          <Button
            onClick={() => {
              regenerateKey();
            }}
            textAlign="left"
            label="Regenerate Key"
            textStyle={{ paddingLeft: 7 }}
            style={{
              width: "100%",
              height: "35%",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingRight: 5,
            }}
          >
            <ArrowDeco width={55}></ArrowDeco>
          </Button>
        </Animated.View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: "auto",
    paddingBottom: "auto",
  },
});
