import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import { CheckBox } from "@/components/common/CheckBox";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useEffect, useState } from "react";
import TextInput from "@/components/common/TextInput";
import { router } from "expo-router";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { getNewRecoveryCodes } from "@/components/utils/createNewAccountInfo";

function Home() {
  const globalStyle = useGlobalStyleStore((r) => r.globalStyle);
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

  useEffect(() => {
    const activeKeyAPI = useActiveKeys.getState();
    if (typeof activeKeyAPI.activeSymmetricKey !== "string") {
      return;
    }
    getNewRecoveryCodes(activeKeyAPI.activeSymmetricKey)
      .then((codes) => {})
      .catch((e) => {});
  }, []);

  useEffect(() => {
    if (newPin === confirmPin && newPin.length >= 4 && newPin.length <= 6) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [newPin, confirmPin]);

  ///Flow state
  const [canContinue, setCanContinue] = useState(false);
  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
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
              label="Regenarate Key [1/3]"
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
                  router.push("/settings/keyRegenerationFlow/newRecoveryCodes");
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
                    canContinue ? globalStyle.color : globalStyle.colorInactive
                  }
                  width={55}
                ></ArrowDeco>
              </Button>
            </Animated.View>
          </Animated.View>
        </>
      </ThemedView>
    </>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
