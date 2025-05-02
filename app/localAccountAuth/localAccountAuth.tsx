import SimpleLoadingScreen from "@/components/common/SimpleLoadingScreen";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  getSymmetricKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import Button from "@/components/common/Button";
import Animated from "react-native-reanimated";
import { FingerprintDeco } from "@/components/deco/FingerprintDeco";
import Text from "@/components/common/Text";
import { useActiveUser } from "@/stores/activeUser";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { router, useGlobalSearchParams } from "expo-router";
import TextInput from "@/components/common/TextInput";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { decodeWrappedSymkey } from "@/components/utils/encoding/wrappedSymkey";
import { useSQLiteContext } from "expo-sqlite";
function localAccountAuth() {
  const activeUserApi = useActiveUser();
  const cryptoOpsApi = useCryptoOpsQueue();
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);

  ///Input state
  const [inputPin, setInputPin] = useState("");

  ///Flow state
  const [readyForAuth, setReadyForAuth] = useState(false);
  const [nativeAuthAvailable, setNativeAuthAvailable] = useState(false);
  const [authViewMode, setAuthViewMode] = useState<"PIN" | "NATIVE">("PIN");

  const db = useSQLiteContext();
  useEffect(() => {
    ///Check if the user has enabled the screen lock method
    const nativeAuthFlag = SecureStore.getItem(
      secureStoreKeyNames.accountConfig.useBiometricAuth
    );
    if (nativeAuthFlag === "true") {
      setNativeAuthAvailable(true);
      setAuthViewMode("NATIVE");
    }
    setReadyForAuth(true);
    nativeAuthChallenge();
  }, []);

  ///UI State
  const [showNativeAuthRetryButton, setShowNativeAuthRetryButton] =
    useState(false);
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  const unwrapKeyAndSetState = useCallback(
    (pin: string, wrappedKeyArg: string) => {
      setIsCheckingPin(true);
      try {
        console.log("Unwrapping key", wrappedKeyArg);
        const decodedWrappedKey = decodeWrappedSymkey(wrappedKeyArg);
        if (decodedWrappedKey === null) {
          console.log("Error decoding wrapped key");
          setIsCheckingPin(false);
          return;
        }
        cryptoOpsApi
          .performOperation("unwrapKey", {
            wrappedKey: decodedWrappedKey.wrappedKey,
            salt: decodedWrappedKey.salt,
            iv: decodedWrappedKey.iv,
            password: pin,
          })
          .then((unwrappedKey) => {
            if (unwrappedKey.status === "success") {
              if (unwrappedKey.payload.key.status === "error") {
                console.log("Error unwrapping key", unwrappedKey.payload.key);
                setIsCheckingPin(false);
                return;
              }
              SecureStore.setItemAsync(
                secureStoreKeyNames.accountConfig.activeSymmetricKey,
                JSON.stringify(unwrappedKey.payload.key)
              )
                .then(() => {
                  router.replace("/home/home");
                })
                .catch((e) => {
                  console.log("Error setting key", e);
                  setIsCheckingPin(false);
                });
            } else {
              setIsCheckingPin(false);
            }
          })
          .catch((e) => {
            console.log("Error unwrapping key", e);
            setIsCheckingPin(false);
          });
      } catch (e) {
        console.log("Error unwrapping key", e);
        setIsCheckingPin(false);
      }
    },
    []
  );

  const nativeAuthChallenge = useCallback(() => {
    const nativeAuthFlag = SecureStore.getItem(
      secureStoreKeyNames.accountConfig.useBiometricAuth
    );
    if (nativeAuthFlag === "true") {
      setIsCheckingPin(true);
      SecureStore.getItemAsync(secureStoreKeyNames.accountConfig.pin, {
        requireAuthentication: true,
        authenticationPrompt: "Authenticate to access your data",
      })
        .then((storedPin) => {
          if (typeof storedPin === "string" && storedPin.length > 0) {
            if (!activeUserApi.activeUser.userId) {
              return;
            }
            SecureStore.getItemAsync(
              getSymmetricKey(activeUserApi.activeUser.userId)
            )
              .then((res) => {
                unwrapKeyAndSetState(storedPin, res ? res : "{}");
              })
              .catch((e) => {
                console.log("Error in native auth", e);
                setIsCheckingPin(false);
                setShowNativeAuthRetryButton(true);
              });
          }
        })
        .catch((e) => {
          console.log("Error in native auth", e);
          setIsCheckingPin(false);
          setShowNativeAuthRetryButton(true);
        });
    }
  }, [
    activeUserApi.activeUser.userId,
    setShowNativeAuthRetryButton,
    setAuthViewMode,
    setNativeAuthAvailable,
  ]);

  return readyForAuth === false ? (
    <SimpleLoadingScreen></SimpleLoadingScreen>
  ) : (
    <ThemedView style={{ ...styles.container }}>
      {authViewMode === "PIN" ? (
        <Animated.View style={{ ...styles.authViewStyle }}>
          <Animated.View
            style={{
              width: "90%",
              marginBottom: 5,
              paddingLeft: 0,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Text
              label={isCheckingPin ? "Authenticating" : "Enter your PIN"}
              textAlign="left"
              style={{ paddingLeft: 0 }}
            ></Text>
            {isCheckingPin && (
              <ActivityIndicator
                size="small"
                color={globalStyle.color}
                style={{ marginLeft: 10 }}
              ></ActivityIndicator>
            )}
          </Animated.View>
          <TextInput
            onChange={(e) => {
              setInputPin(e.nativeEvent.text);
            }}
            secureTextEntry={true}
            textAlign="left"
            placeholder="Enter your PIN"
            keyboardType="numeric"
            style={{ width: "90%", height: "6.5%", marginBottom: 5 }}
          ></TextInput>
          <Text
            label="Your PIN is required to decrypt your data"
            fontSize={globalStyle.mediumMobileFont}
            style={{ width: "90%", marginBottom: 20, paddingLeft: 0 }}
            textAlign="left"
          ></Text>
          <Animated.View
            style={{
              width: "100%",
              height: "6.5%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Button
              onClick={() => {
                if (inputPin.length > 0 && activeUserApi.activeUser.userId) {
                  SecureStore.getItemAsync(
                    getSymmetricKey(activeUserApi.activeUser.userId)
                  )
                    .then((res) => {
                      unwrapKeyAndSetState(inputPin, res ? res : "{}");
                    })
                    .catch((e) => {
                      console.log("Error in native auth", e);
                    });
                }
              }}
              label="Continue"
              style={{ width: "90%", height: "100%" }}
            ></Button>
          </Animated.View>
          {nativeAuthAvailable && (
            <Animated.View
              style={{
                width: "100%",
                height: "6.5%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={() => {
                  nativeAuthChallenge();
                }}
                label="Retry with screen lock"
                style={{ width: "90%", height: "100%" }}
              ></Button>
            </Animated.View>
          )}
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FingerprintDeco
            width={90}
            height={"5.5%"}
            style={{ marginBottom: 15 }}
          ></FingerprintDeco>
          <Animated.View
            style={{ marginBottom: 30, display: "flex", flexDirection: "row" }}
          >
            <Text
              label={
                isCheckingPin
                  ? "Authenticating"
                  : "Use biometrics to decrypt your data"
              }
            ></Text>
            {isCheckingPin && (
              <ActivityIndicator
                size="small"
                color={globalStyle.color}
                style={{ marginLeft: 10 }}
              ></ActivityIndicator>
            )}
          </Animated.View>
          <Button
            onClick={() => {
              setAuthViewMode("PIN");
            }}
            label="Use your PIN instead"
            style={{ width: "90%", height: "6.5%", marginBottom: 20 }}
          ></Button>
          {showNativeAuthRetryButton && (
            <Animated.View
              style={{
                width: "100%",
                height: "6.5%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={() => {
                  nativeAuthChallenge();
                }}
                label="Retry screen lock"
                style={{ width: "90%", height: "100%" }}
              ></Button>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </ThemedView>
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
  authViewStyle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default localAccountAuth;
