import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import * as NavigationBar from "expo-navigation-bar";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import * as Updates from "expo-updates";
import { router } from "expo-router";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { FooterComponent } from "react-native-screens/lib/typescript/components/ScreenFooter";
import { SimpleFooter } from "@/components/common/SimpleFooter";
function AccountKeys() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
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
