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

function AccountKeys() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const db = useSQLiteContext();
  const activeUserAccountType = useActiveUser(
    (state) => state.activeUser.accountType
  );

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
