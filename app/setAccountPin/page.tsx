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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import TextInput from "@/components/common/TextInput";
import { CheckBox } from "@/components/common/CheckBox";
import { act, useCallback, useEffect, useState } from "react";
import { getNewRecoveryCodes } from "@/components/utils/createNewAccountInfo";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { router } from "expo-router";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();

  ///Input state
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isNewPinValid, setIsNewPinValid] = useState(false);
  const [isWaitingRecoveryCodes, setIsWaitingRecoveryCodes] =
    useState<boolean>(false);

  useEffect(() => {
    const newPinLength = newPin.length;
    setIsNewPinValid(
      newPinLength >= 4 && newPinLength <= 6 && !isNaN(Number(newPin)),
    );
  }, [newPin]);

  ///Flow state
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(isNewPinValid && confirmPin === newPin);
  }, [confirmPin]);

  ///Biometric auth state
  const [useBiometricAuth, setUseBiometricAuth] = useState(false);

  const handlePinSubmit = useCallback(async () => {
    const symmetricKeyJwk = useActiveKeys.getState().activeSymmetricKey;

    if (!canContinue || symmetricKeyJwk === null) {
      return;
    }

    setIsWaitingRecoveryCodes(true);
    await getNewRecoveryCodes(symmetricKeyJwk, newPin)
      .then((response) => {
        if (response.status !== "failed") {
          const currentNewUserData = newUserDataApi.userData;
          newUserDataApi.setUserData({
            ...currentNewUserData,
            RCKBackup: response.RCKBackup,
          });
          router.push("/downloadRecoveryCodes/page");
        } else {
          setIsWaitingRecoveryCodes(false);
        }
      })
      .catch(() => {});
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
                    label="One-time Setup [1/3]"
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
                      newUserDataApi.setNewPIN(e.nativeEvent.text);
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
                      {isWaitingRecoveryCodes ? (
                        <ActivityIndicator
                          color={globalStyle.color}
                          size="small"
                        ></ActivityIndicator>
                      ) : (
                        <ArrowDeco
                          color={
                            canContinue
                              ? globalStyle.color
                              : globalStyle.colorInactive
                          }
                          width={55}
                        ></ArrowDeco>
                      )}
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
                          newUserDataApi.setUseBiometricAuth(e);
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
