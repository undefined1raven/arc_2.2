import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { FooterComponent } from "react-native-screens/lib/typescript/components/ScreenFooter";
import { SimpleFooter } from "@/components/common/SimpleFooter";
import { useSQLiteContext } from "expo-sqlite";
import { getPrivateKey } from "@/components/utils/constants/secureStoreKeyNames";
import * as SecureStore from "expo-secure-store";
import { useActiveUser } from "@/stores/activeUser";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { NetworkDeco } from "@/components/deco/NetworkDeco";
import { useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import {
  charCodeArrayToString,
  stringToCharCodeArray,
} from "@/components/utils/fn/charOps";
import { useActiveKeys } from "@/stores/decryptedKeys";

function AccountKeys() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const db = useSQLiteContext();
  const activeUserAccountType = useActiveUser(
    (state) => state.activeUser.accountType
  );
  const userId = useActiveUser((state) => state.activeUser.userId || null);

  const onChangeAccountType = useCallback(() => {
    const activePrivateKey = useActiveKeys.getState().activePrivateKey;
    if (!userId || !activePrivateKey) {
      return;
    }
    const cryptoAPI = useCryptoOpsQueue.getState();
    console.log("Changing account type");
    const userData = db.getFirstSync("SELECT * FROM users WHERE id = ?", [
      userId,
    ]) as any;
    axios
      .post(`${API_URL}/account/createOnlineAccountFromLocal`, {
        data: {
          appID: APP_ID,
          userData: userData,
        },
      })
      .then((r) => {
        console.log("ACT_SW_R", r.data);
        if (r.data.success) {
          console.log("Account type changed to online");
          const challengeStr = r.data.challenge;
          const charCodeData = JSON.stringify(
            stringToCharCodeArray(challengeStr)
          );
          console.log("ACT_SW_CR", charCodeData);
          cryptoAPI
            .performOperation("decrypt", {
              keyType: "private",
              charCodeData: charCodeData,
              key: activePrivateKey,
            })
            .then((decryptResponse) => {
              console.log("ACT_SW_VR", decryptResponse);
            })
            .catch((e) => {
              console.log("ACT_SW_DER", e);
            });
        }
      })
      .catch((e) => {
        console.log("ACT_SW_R", e);
      });
  }, [activeUserAccountType]);
  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {activeUserAccountType === null && (
          <ActivityIndicator color={globalStyle.color} />
        )}
        <Text
          style={{
            width: "100%",
            paddingLeft: 0,
          }}
          textAlign="left"
          label="Your account is"
        ></Text>
        <View
          style={{
            borderRadius: globalStyle.borderRadius,
            height: 60,
            width: "100%",
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            gap: 10,
            paddingLeft: 10,
          }}
        >
          <Text
            style={{ fontSize: 25 }}
            textAlign="center"
            label={activeUserAccountType === "online" ? "Online" : "Local"}
          ></Text>
        </View>
        <Button
          onClick={onChangeAccountType}
          backgroundColor={globalStyle.colorAltLight}
          label={`Switch to ${
            activeUserAccountType === "online" ? "local" : "online"
          } account`}
          style={{ width: "80%", height: 60, marginTop: 20, marginBottom: 20 }}
        ></Button>
        <SimpleFooter
          showEnteringAnimation={true}
          label="Settings / Account Type"
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
