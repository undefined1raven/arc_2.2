import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import { ARCLogo } from "@/components/deco/ARCLogo";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useNewUserData } from "@/stores/newUserData";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import Text from "@/components/common/Text";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();
  return (
    <>
      <ThemedView style={styles.container}>
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
        ) : null}
      </ThemedView>
    </>
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
