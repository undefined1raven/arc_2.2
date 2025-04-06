import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";
import { BackgroundTaskRunner } from "@/components/utils/LocalWebView";
import { getCryptoOpsFn } from "@/components/utils/cryptoOps";
import { CryptoWorkers } from "@/components/utils/CryptoWorkers";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { checkTables } from "@/components/utils/db/checkTables";
import Button from "@/components/common/Button";
import { ARCLogo } from "@/components/deco/ARCLogo";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useNewUserData } from "@/stores/newUserData";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogo style={{ width: 200, height: 100 }}></ARCLogo>
        <Button
          fontSize={globalStyle.largeMobileFont}
          onClick={() => {
            const newUserDataApi = useNewUserData.getState();
            console.log("New User Data API", newUserDataApi.recoveryCodes);
          }}
          style={styles.button}
          label="Login"
        ></Button>
        <Button
          onClick={() => {
            router.push("/downloadRecoveryCodes/page");
          }}
          fontSize={globalStyle.largeMobileFont}
          style={styles.button}
          label="Create Account"
        ></Button>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "80%",
    height: 60,
    borderRadius: 10,
    marginTop: 20,
  },
  container: {
    flex: 1,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: "auto",
  },
});
