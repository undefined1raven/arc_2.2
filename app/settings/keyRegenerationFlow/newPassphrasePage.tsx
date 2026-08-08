import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import { ARCLogo } from "@/components/deco/ARCLogo";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useNewUserData } from "@/stores/newUserData";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import * as Clipboard from "expo-clipboard";
import Text from "@/components/common/Text";
import SimpleHeader from "@/components/common/SimpleHeader";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { DownloadDeco } from "@/components/deco/DownloadDeco";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { saveFile } from "@/components/utils/fn/saveFile";
import { CopyDeco } from "@/components/deco/CopyDeco";
import { useCallback, useEffect, useState } from "react";
import { generateSecretKey } from "@/components/utils/createNewAccountInfo";
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
import { encodeWrappedSymkey } from "@/components/utils/encoding/wrappedSymkey";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useSQLiteContext } from "expo-sqlite";
import { stringToCharCodeArray } from "@/components/utils/fn/charOps";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const activeUserApi = useActiveUser((r) => r.activeUser);
  const db = useSQLiteContext();
  const symkey = useActiveKeys((state) => state.activeSymmetricKey);
  const keyRegenTempStoreAPI = keyRegenTempStore.getState();
  const newPassphrase = keyRegenTempStore((state) => state.newPassphrase);
  const updateUserPIKAndRCKBackup = useCallback(
    async (PIKBackup: string, RCKBackup: string | null) => {
      if (
        typeof PIKBackup !== "string" ||
        PIKBackup.length === 0 ||
        RCKBackup === null
      ) {
        return;
      }
      db.runAsync(
        `UPDATE users SET PIKBackup = ?, RCKBackup = ? WHERE id = ?`,
        [PIKBackup, RCKBackup, activeUserApi.userId],
      ).catch((e) => {
        console.error("Error updating PIKBackup in DB:", e);
      });
    },
    [activeUserApi.userId],
  );

  const updateKeyPair = useCallback(async () => {
    const plainKey = symkey;
    const cryptoOpsApi = useCryptoOpsQueue.getState();

    const newKeyPair = await cryptoOpsApi.performOperation(
      "generateDPoPKeyPair",
    );

    if (newKeyPair.status !== "success") {
      console.error("Failed to generate key pair");
      return { status: "error", error: "FGKP" };
    }

    const newKeyPairData = newKeyPair.payload;
    const privateKey = newKeyPairData.privateKey;
    const publicKey = newKeyPairData.publicKey;

    const encryptedPrivateKeyRes = await cryptoOpsApi.performOperation(
      "encrypt",
      {
        keyType: "symmetric",
        key: plainKey,
        charCodeData: stringToCharCodeArray(privateKey),
      },
    );
    if (encryptedPrivateKeyRes.status !== "success") {
      console.error("Failed to encrypt private key", encryptedPrivateKeyRes);
      return { status: "error", error: "FEPK" };
    }
    const encryptedPrivateKey = JSON.stringify(encryptedPrivateKeyRes.payload);
    return db
      .runAsync(`UPDATE users SET publicKey = ?, PSKBackup = ? WHERE id = ?`, [
        publicKey,
        encryptedPrivateKey,
        activeUserApi.userId,
      ])
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
        return { status: "success" };
      });
  }, [symkey]);

  const regenerateKey = useCallback(() => {
    const keyRegenTempStoreAPI = keyRegenTempStore.getState();
    const newPIN = keyRegenTempStoreAPI.pin;
    const activeUserId = activeUserApi.userId;
    const plainKey = symkey;
    const cryptoOpsApi = useCryptoOpsQueue.getState();
    if (
      activeUserId === null ||
      newPIN === null ||
      newPassphrase === null ||
      plainKey === null
    ) {
      return;
    }
    const newKeyWrapPassword = newPIN + newPassphrase;

    const hasBioAuth = SecureStore.getItem(
      secureStoreKeyNames.accountConfig.useBiometricAuth,
    );

    if (hasBioAuth) {
      cryptoOpsApi
        .performOperation("wrapKey", {
          password: newKeyWrapPassword,
          jwkKeyData: plainKey,
          keyType: "symmetric",
        })
        .then(async (res) => {
          if (res.status !== "success") {
            return;
          }
          async function basicSecureStoreSave(userId: string) {
            const wrappedSymKey = encodeWrappedSymkey(res.payload);
            if (wrappedSymKey === null) {
              console.error("Error encoding wrapped symmetric key");
              return;
            }
            console.log("Saving new wrapped symmetric key");
            await SecureStore.setItemAsync(
              getSymmetricKey(userId),
              wrappedSymKey,
            );
          }
          const wrappedSymKey = encodeWrappedSymkey(res.payload);
          if (wrappedSymKey === null) {
            console.error("Error encoding wrapped symmetric key");
            return;
          }
          await SecureStore.setItemAsync(
            getSymmetricKey(activeUserId),
            wrappedSymKey,
          )
            .then(async () => {
              const RCKBackup = keyRegenTempStoreAPI.newRCK;
              const updatePIKPromise = updateUserPIKAndRCKBackup(
                wrappedSymKey,
                RCKBackup,
              );
              const keyUpdateResponse = await updateKeyPair();

              if (keyUpdateResponse.status !== "success") {
                console.error(
                  "Error updating key pair:",
                  keyUpdateResponse.error,
                );
                return;
              }
              ///Restart app
              const updateNoBioPassphraseStorage = SecureStore.setItemAsync(
                noBioSKName,
                newPassphrase,
              );
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

              Promise.all([
                updatePIKPromise,
                updateBioAuthSecureStoreKeyPromise,
                updateNoBioPassphraseStorage,
              ])
                .then(() => {
                  Updates.reloadAsync();
                })
                .catch((err) => {
                  basicSecureStoreSave(activeUserId);
                });
            })
            .catch(async (err) => {
              basicSecureStoreSave(activeUserId);
            });
        })
        .catch((err) => {
          console.error("Error wrapping symmetric key:", err);
        });
    }
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
