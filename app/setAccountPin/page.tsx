import "react-native-get-random-values";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { v4 } from "uuid";

import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useNewUserData } from "@/stores/newUserData";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import Text from "@/components/common/Text";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import TextInput from "@/components/common/TextInput";
import { CheckBox } from "@/components/common/CheckBox";
import { act, useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  getPrivateKey,
  getSymmetricKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { saveNewUser } from "@/components/utils/db/saveNewUser";
import { stringToCharCodeArray } from "@/components/utils/fn/charOps";
import { encodeWrappedSymkey } from "@/components/utils/encoding/wrappedSymkey";
import { reloadAsync } from "expo-updates";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { getInsertStringFromObject } from "@/components/utils/db/dbUtils";
import { chunkPrefixes } from "@/constants/chunkPrefixes";
import * as SQLite from "expo-sqlite";
import {
  ARC_ChunksType,
  SID_ChunksType,
  SIDGroups_ChunksType,
  Tess_ChunksType,
} from "@/constants/CommonTypes";
import * as Crypto from "expo-crypto";

async function createEmptyEncryptedChunkContent(jwkKeyData: string) {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const emptyEncryptedArray = await cryptoOpsApi.performOperation("encrypt", {
    keyType: "symmetric",
    key: jwkKeyData,
    charCodeData: stringToCharCodeArray(JSON.stringify([])),
  });

  const emptyEncryptedContent = JSON.stringify(emptyEncryptedArray.payload);

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    emptyEncryptedContent
  );

  return { content: emptyEncryptedContent, hash: hash };
}

async function createEmptyChunks(jwkKeyData: string, userId: string) {
  const db = await SQLite.openDatabaseAsync("localCache");

  const empty1 = await createEmptyEncryptedChunkContent(jwkKeyData);
  const empty2 = await createEmptyEncryptedChunkContent(jwkKeyData);
  const empty3 = await createEmptyEncryptedChunkContent(jwkKeyData);
  const empty4 = await createEmptyEncryptedChunkContent(jwkKeyData);

  const emptyNewTimeTrackingChunk: ARC_ChunksType = {
    id: `${chunkPrefixes["timeTrackingChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty1.content,
    tx: Date.now(),
    timeRangeStart: Date.now(),
    timeRangeEnd: Date.now(),
    version: "0.1.2",
    hash: empty1.hash,
  };

  const emptyNewDayPlannerChunk: Tess_ChunksType = {
    id: `${chunkPrefixes["dayPlannerChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty2.content,
    tx: Date.now(),
    timeRangeStart: Date.now(),
    timeRangeEnd: Date.now(),
    version: "0.1.2",
    hash: empty2.hash,
  };

  const emptyNewPersonalDiaryChunk: SID_ChunksType = {
    id: `${chunkPrefixes["personalDiaryChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty3.content,
    tx: Date.now(),
    version: "0.1.2",
    hash: empty3.hash,
  };

  const emptyNewPersonalDiaryGroupChunk: SIDGroups_ChunksType = {
    id: `${chunkPrefixes["personalDiaryGroupChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty4.content,
    tx: Date.now(),
    version: "0.1.2",
    hash: empty4.hash,
  };

  const timeTrackingInsertHelperVals = getInsertStringFromObject(
    emptyNewTimeTrackingChunk
  );
  const timeTrackingChunkPromise = db.runAsync(
    `INSERT INTO timeTrackingChunks ${timeTrackingInsertHelperVals.queryString}`,
    [...timeTrackingInsertHelperVals.values]
  );

  const dayPlannerInsertHelperVals = getInsertStringFromObject(
    emptyNewDayPlannerChunk
  );
  const dayPlannerChunkPromise = db.runAsync(
    `INSERT INTO dayPlannerChunks  ${dayPlannerInsertHelperVals.queryString}`,
    dayPlannerInsertHelperVals.values
  );

  const personalDiaryInsertHelperVals = getInsertStringFromObject(
    emptyNewPersonalDiaryChunk
  );
  const personalDiaryChunkPromise = db.runAsync(
    `INSERT INTO personalDiaryChunks ${personalDiaryInsertHelperVals.queryString}`,
    personalDiaryInsertHelperVals.values
  );

  const personalDiaryGroupInsertHelperVals = getInsertStringFromObject(
    emptyNewPersonalDiaryGroupChunk
  );
  const personalDiaryGroupChunkPromise = db.runAsync(
    `INSERT INTO personalDiaryGroups ${personalDiaryGroupInsertHelperVals.queryString}`,
    personalDiaryGroupInsertHelperVals.values
  );

  return Promise.all([
    timeTrackingChunkPromise,
    dayPlannerChunkPromise,
    personalDiaryChunkPromise,
    personalDiaryGroupChunkPromise,
  ]);
}

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();

  ///Input state
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isNewPinValid, setIsNewPinValid] = useState(false);

  useEffect(() => {
    const newPinLength = newPin.length;
    setIsNewPinValid(
      newPinLength >= 4 && newPinLength <= 6 && !isNaN(Number(newPin))
    );
  }, [newPin]);

  ///Flow state
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(isNewPinValid && confirmPin === newPin);
  }, [confirmPin]);

  ///Biometric auth state
  const [authAvailable, setAuthAvailable] = useState(true); ///Assume true unless we get an error during enrollment
  const [useBiometricAuth, setUseBiometricAuth] = useState(false);

  const handlePinSubmit = useCallback(async () => {
    if (!canContinue) {
      return;
    }
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

    await createEmptyChunks(symmetricKeyJwk, userId);

    cryptoOpsApi
      .performOperation("wrapKey", {
        password: newPin + newUserDataApi.secretKey,
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
              wrappedSymKey
            );

            await SecureStore.setItemAsync(
              getPrivateKey(userId),
              //@ts-expect-error
              armoredPrivateKey
            );
            await SecureStore.setItemAsync(
              secureStoreKeyNames.accountConfig.useBiometricAuth,
              "false"
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
          if (useBiometricAuth === false) {
            basicSecureStoreSave(userId);
          } else {
            await SecureStore.setItemAsync(
              getPrivateKey(userId),
              armoredPrivateKey
            );
            const wrappedSymKey = encodeWrappedSymkey(res.payload);
            if (wrappedSymKey === null) {
              console.error("Error encoding wrapped symmetric key");
              return;
            }
            await SecureStore.setItemAsync(
              getSymmetricKey(userId),
              wrappedSymKey
            )
              .then(async () => {
                ///Redirect to home
                await SecureStore.setItemAsync(
                  secureStoreKeyNames.accountConfig.useBiometricAuth,
                  "true"
                );
                await SecureStore.setItemAsync(
                  secureStoreKeyNames.accountConfig.pin,
                  newPin + newUserDataApi.secretKey,
                  {
                    requireAuthentication: true,
                    authenticationPrompt:
                      "Authenticate to use your screen lock to unlock",
                  }
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
                setAuthAvailable(false);
                basicSecureStoreSave(userId);
              });
          }
        }
      })
      .catch((err) => {
        console.error("Error wrapping symmetric key:", err);
      });
  }, [newPin, canContinue, useBiometricAuth]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      onPressIn={() => {
        Keyboard.dismiss();
      }}
    >
      <>
        <ThemedView style={styles.container}>
          <>
            {newUserDataApi.isGeneratingKeysAndConfig ? (
              <>
                <View
                  style={{
                    width: "70%",
                    height: "30%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ARCLogoMini style={{ height: 50, width: 50 }}></ARCLogoMini>
                  <Text
                    style={{ marginTop: "5%" }}
                    label="Generating secure keys"
                  ></Text>
                  <ActivityIndicator
                    style={{ marginTop: "5%" }}
                    color={globalStyle.color}
                  ></ActivityIndicator>
                </View>
              </>
            ) : (
              <>
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
                    label="One-time Setup [3/3]"
                    style={{
                      height: "100%",
                      width: "100%",
                      marginBottom: 10,
                    }}
                    backgroundColor={globalStyle.color + "20"}
                  ></Text>
                </Animated.View>
                <Animated.View style={{ width: "100%", height: "85%" }}>
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
                      label="Set a PIN"
                      style={{
                        height: "100%",
                        width: "100%",
                        marginBottom: 5,
                        paddingLeft: 0,
                      }}
                    ></Text>
                  </Animated.View>
                  <Animated.View
                    entering={FadeIn}
                    style={{
                      width: "100%",
                      marginBottom: 5,
                      height: "8%",
                    }}
                  >
                    <Text
                      fontSize={globalStyle.mediumMobileFont}
                      numberOfLines={50}
                      ellipsizeMode="middle"
                      textAlign="left"
                      label="You can use this pin to better protect your data as well as a recovery method"
                      style={{
                        height: "100%",
                        width: "100%",
                        marginBottom: 5,
                        paddingLeft: 0,
                      }}
                    ></Text>
                  </Animated.View>
                  <Animated.View
                    entering={FadeIn}
                    style={{
                      width: "100%",
                      marginBottom: 0,
                      height: "5%",
                    }}
                  >
                    <Text
                      textAlign="left"
                      label="Set a new PIN [between 4 and 6 digits]"
                      style={{
                        height: "100%",
                        width: "100%",
                        marginBottom: 2,
                        paddingLeft: 0,
                      }}
                    ></Text>
                  </Animated.View>
                  <TextInput
                    onChange={(e) => {
                      setNewPin(e.nativeEvent.text);
                    }}
                    textAlign="left"
                    secureTextEntry={true}
                    style={{ width: "100%", height: 50, marginBottom: 10 }}
                    keyboardType="numeric"
                    color={
                      newPin.length > 0
                        ? isNewPinValid
                          ? globalStyle.successTextColor
                          : globalStyle.errorTextColor
                        : globalStyle.textColor
                    }
                    borderColor={
                      newPin.length > 0
                        ? isNewPinValid
                          ? globalStyle.successColor
                          : globalStyle.errorColor
                        : globalStyle.textColor
                    }
                    backgroundColor={
                      newPin.length > 0
                        ? isNewPinValid
                          ? globalStyle.successColor + "20"
                          : globalStyle.errorColor + "20"
                        : globalStyle.textColor + "20"
                    }
                  ></TextInput>
                  <Animated.View
                    entering={FadeIn}
                    style={{
                      width: "100%",
                      marginBottom: 0,
                      height: "5%",
                    }}
                  >
                    <Text
                      textAlign="left"
                      label="Confirm PIN"
                      style={{
                        height: "100%",
                        width: "100%",
                        marginBottom: 2,
                        paddingLeft: 0,
                      }}
                    ></Text>
                  </Animated.View>
                  <TextInput
                    onChange={(e) => {
                      setConfirmPin(e.nativeEvent.text);
                    }}
                    secureTextEntry={true}
                    textAlign="left"
                    color={
                      confirmPin.length > 0
                        ? isNewPinValid && confirmPin === newPin
                          ? globalStyle.successTextColor
                          : globalStyle.errorTextColor
                        : globalStyle.textColor
                    }
                    borderColor={
                      confirmPin.length > 0
                        ? isNewPinValid && confirmPin === newPin
                          ? globalStyle.successColor
                          : globalStyle.errorColor
                        : globalStyle.textColor
                    }
                    backgroundColor={
                      confirmPin.length > 0
                        ? isNewPinValid && confirmPin === newPin
                          ? globalStyle.successColor + "20"
                          : globalStyle.errorColor + "20"
                        : globalStyle.textColor + "20"
                    }
                    style={{ width: "100%", height: 50, marginBottom: 30 }}
                    keyboardType="numeric"
                  ></TextInput>
                  <Animated.View
                    entering={FadeInDown}
                    style={{ height: "7%", width: "100%", marginBottom: 20 }}
                  >
                    <Button
                      onClick={() => {
                        handlePinSubmit();
                      }}
                      disabled={canContinue ? false : true}
                      textAlign="left"
                      label="Continue"
                      textStyle={{ paddingLeft: 7 }}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        paddingRight: 5,
                      }}
                    >
                      <ArrowDeco
                        color={
                          canContinue
                            ? globalStyle.color
                            : globalStyle.colorInactive
                        }
                        width={55}
                      ></ArrowDeco>
                    </Button>
                  </Animated.View>
                  <Animated.View
                    style={{
                      width: "100%",
                      height: 30,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Animated.View
                      style={{
                        width: 30,
                        height: "100%",
                        zIndex: 2,
                      }}
                    >
                      <CheckBox
                        hitSlop={15}
                        checked={false}
                        checkedColor={globalStyle.color + "AA"}
                        uncheckedColor={globalStyle.color + "10"}
                        onChange={(e) => {
                          setUseBiometricAuth(e);
                        }}
                        style={{ width: "100%", height: "100%" }}
                      ></CheckBox>
                    </Animated.View>
                    <Animated.View
                      style={{
                        flexGrow: 1,
                        height: "100%",
                      }}
                    >
                      <Text
                        textAlign="left"
                        label="Use biometric authentication"
                        style={{
                          height: "100%",
                          width: "100%",
                          marginBottom: 5,
                          paddingLeft: 10,
                        }}
                      ></Text>
                    </Animated.View>
                  </Animated.View>
                </Animated.View>
              </>
            )}
          </>
        </ThemedView>
      </>
    </TouchableWithoutFeedback>
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
