import "react-native-get-random-values";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useNewUserData } from "@/stores/newUserData";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import Text from "@/components/common/Text";
import SimpleHeader from "@/components/common/SimpleHeader";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import TextInput from "@/components/common/TextInput";
import { CheckBox } from "@/components/common/CheckBox";
import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  getPrivateKey,
  getSymmetricKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { saveNewUser } from "@/components/utils/db/saveNewUser";
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
    const symmetricKeyJwk = await SecureStore.getItemAsync(
      secureStoreKeyNames.temporary.symmetricKey
    );
    const privateKeyJwk = await SecureStore.getItemAsync(
      secureStoreKeyNames.temporary.privateKey
    );
    if (
      typeof symmetricKeyJwk !== "string" ||
      typeof privateKeyJwk !== "string"
    ) {
      return;
    }
    cryptoOpsApi
      .performOperation("wrapKey", {
        password: newPin,
        jwkKeyData: symmetricKeyJwk,
        keyType: "symmetric",
      })
      .then(async (res) => {
        if (res.status === "success") {
          async function basicSecureStoreSave(userId: string) {
            if (typeof privateKeyJwk !== "string") {
              return;
            }

            await SecureStore.setItemAsync(
              getSymmetricKey(userId),
              JSON.stringify(res.payload)
            );
            await SecureStore.setItemAsync(
              getPrivateKey(userId),
              privateKeyJwk
            );
            await SecureStore.setItemAsync(
              secureStoreKeyNames.accountConfig.useBiometricAuth,
              "false"
            );
            ///Redirect to home
            saveNewUser()
              .then(() => {
                console.log("Saved new user");
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
              privateKeyJwk
            );
            await SecureStore.setItemAsync(
              getSymmetricKey(userId),
              JSON.stringify(res.payload)
            )
              .then(async () => {
                ///Redirect to home
                await SecureStore.setItemAsync(
                  secureStoreKeyNames.accountConfig.useBiometricAuth,
                  "true"
                );
                await SecureStore.setItemAsync(
                  secureStoreKeyNames.accountConfig.pin,
                  newPin,
                  {
                    requireAuthentication: true,
                    authenticationPrompt:
                      "Authenticate to use your screen lock to unlock",
                  }
                );
                saveNewUser()
                  .then(() => {
                    console.log("Saved new user");
                  })
                  .catch((e) => {});
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
            <SimpleHeader></SimpleHeader>
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
                    label="One-time Setup [2/2]"
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
