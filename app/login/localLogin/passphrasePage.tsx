import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ThemedView } from "@/components/ThemedView";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import Text from "@/components/common/Text";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import TextInput from "@/components/common/TextInput";
import { BottomMenu } from "./common/bottomMenu";
import { useOfflineLoginTempStore } from "@/stores/offlineLoginTempStore";

function LocalLogin() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const offlineLoginTempStore = useOfflineLoginTempStore();

  const [passphrase, setPassphrase] = useState<null | string>(null);
  const [hasValidPassphrase, setHasValidPassphrase] = useState(false);

  useEffect(() => {
    if (passphrase !== null && passphrase?.length > 9) {
      setHasValidPassphrase(true);
    } else {
      setHasValidPassphrase(false);
    }
  }, [passphrase]);

  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini
          style={{
            position: "absolute",
            top: "35%",
            width: 40,
            height: 60,
          }}
        ></ARCLogoMini>
        <Text
          textAlign="left"
          style={{ height: "5%", width: "80%", marginBottom: "2%" }}
          backgroundColor={globalStyle.color + "20"}
          fontSize={globalStyle.largeMobileFont}
          label="Account Passphrase"
        ></Text>
        <Text
          textAlign="left"
          numberOfLines={8}
          fontSize={globalStyle.regularMobileFont}
          style={{ width: "85%", marginBottom: "10%" }}
          label="This is the passphrase generated when you created your account"
        ></Text>
        <TextInput
          style={{ width: "80%", height: "6%" }}
          keyboardType="numeric"
          secureTextEntry={true}
          onChange={(e) => {
            const passphrase = e.nativeEvent.text;
            offlineLoginTempStore.setPassphrase(passphrase);
            setPassphrase(passphrase);
          }}
        ></TextInput>
        <BottomMenu
          canGoForward={hasValidPassphrase}
          onNextButton={() => {
            if (hasValidPassphrase) {
              router.push("/login/localLogin/localLogin");
            }
          }}
        ></BottomMenu>
      </ThemedView>
    </>
  );
}
export default LocalLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
