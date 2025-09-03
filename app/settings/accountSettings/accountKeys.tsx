import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { FooterComponent } from "react-native-screens/lib/typescript/components/ScreenFooter";
import { SimpleFooter } from "@/components/common/SimpleFooter";
import { KeyDeco } from "@/components/deco/KeyDeco";
import { router } from "expo-router";
function AccountKeys() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <Text
          textAlign="left"
          style={{ paddingLeft: 0, position: "relative", left: -5 }}
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
