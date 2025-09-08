import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { FooterComponent } from "react-native-screens/lib/typescript/components/ScreenFooter";
import { SimpleFooter } from "@/components/common/SimpleFooter";
import { KeyDeco } from "@/components/deco/KeyDeco";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { stringToCharCodeArray } from "@/components/utils/fn/charOps";
import { useActiveUser } from "@/stores/activeUser";
import { useSQLiteContext } from "expo-sqlite";

function AccountKeys() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const db = useSQLiteContext();

  const [isRegeneratingPrivateKey, setIsRegeneratingPrivateKey] =
    useState(false);
  const [privateKeyRegenResult, setPrivateKeyRegenResult] = useState<
    "success" | "error" | null
  >(null);

  const regenPrivateKey = useCallback(async () => {
    function setKeyRegenStatus(status: "success" | "error") {
      setIsRegeneratingPrivateKey(false);
      setPrivateKeyRegenResult(status);
      setTimeout(() => {
        setPrivateKeyRegenResult(null);
      }, 2000);
    }

    if (isRegeneratingPrivateKey) {
      return;
    }
    setIsRegeneratingPrivateKey(true);
    const cryptoAPI = useCryptoOpsQueue.getState();
    const activeKeyAPI = useActiveKeys.getState();
    const activeUserAPI = useActiveUser.getState();
    const currentUserId = activeUserAPI.activeUser.userId;
    if (currentUserId === null) {
      return;
    }
    cryptoAPI
      .performOperation("generateKeyPair")
      .then(async (res) => {
        if (res.status === "success") {
          const privateKey = res.payload.privateKey;
          const publicKey = res.payload.publicKey;
          const symKey = activeKeyAPI.activeSymmetricKey;
          if (typeof symKey !== "string") {
            setKeyRegenStatus("error");
            return;
          }
          const armoredPrivateKeyRes = await cryptoAPI.performOperation(
            "encrypt",
            {
              keyType: "symmetric",
              key: symKey,
              charCodeData: stringToCharCodeArray(privateKey),
            }
          );
          if (armoredPrivateKeyRes.status === "success") {
            const armoredPrivateKey = JSON.stringify(
              armoredPrivateKeyRes.payload
            );
            db.runAsync(
              "UPDATE users SET publicKey = ?, PSKBackup = ? WHERE id = ?;",
              [publicKey, armoredPrivateKey, currentUserId]
            )
              .then(() => {
                setKeyRegenStatus("success");
              })
              .catch((e) => {
                setKeyRegenStatus("error");
                console.error("Failed to update public key and private key", e);
              });
          } else {
            setKeyRegenStatus("error");
            return;
          }
        } else {
          setKeyRegenStatus("error");
          return;
        }
      })
      .catch(() => {
        setKeyRegenStatus("error");
        return;
      });
  }, [isRegeneratingPrivateKey]);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <View
          style={{
            width: "100%",
            height: 120,
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Button
            onClick={regenPrivateKey}
            style={{
              top: "0%",
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 2,
            }}
          ></Button>
          <Text
            fontSize={globalStyle.largeMobileFont}
            label="Regenerate Private Key"
            style={{ zIndex: 0 }}
          ></Text>
          {isRegeneratingPrivateKey && (
            <ActivityIndicator
              size="small"
              color={globalStyle.color}
            ></ActivityIndicator>
          )}
          {privateKeyRegenResult !== null && !isRegeneratingPrivateKey && (
            <Text
              fontSize={globalStyle.regularMobileFont}
              color={
                privateKeyRegenResult === "error"
                  ? globalStyle.errorColor
                  : globalStyle.successColor
              }
              label={privateKeyRegenResult === "error" ? "Error" : "Success"}
              style={{ zIndex: 0, marginTop: 5 }}
            ></Text>
          )}
          <KeyDeco height={35} width={25}></KeyDeco>
        </View>
        <Text
          textAlign="left"
          style={{
            paddingLeft: 0,
            position: "relative",
            left: -5,
            marginTop: 15,
          }}
          numberOfLines={10}
          label="Regenerating your key allows you to set a new PIN for your account as well as getting new recovery codes and passphrase"
        ></Text>
        <View
          style={{
            width: "100%",
            height: 120,
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => {
              router.push("/settings/keyRegenerationFlow/newPinPage");
            }}
            style={{
              top: "0%",
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 2,
            }}
          ></Button>
          <Text
            fontSize={globalStyle.largeMobileFont}
            label="Regenerate Key"
            style={{ zIndex: 0 }}
          ></Text>
          <KeyDeco height={35} width={25}></KeyDeco>
        </View>
        <SimpleFooter
          showEnteringAnimation={true}
          label="Key Management"
        ></SimpleFooter>
      </ThemedView>
    </>
  );
}
export default AccountKeys;

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
