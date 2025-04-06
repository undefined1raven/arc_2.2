import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";
import { BackgroundTaskRunner } from "@/components/utils/LocalWebView";
import { getCryptoOpsFn } from "@/components/utils/cryptoOps";
import { CryptoWorkers } from "@/components/utils/CryptoWorkers";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import {
  checkTables,
  CheckTablesReturnSig,
} from "@/components/utils/db/checkTables";
import Button from "@/components/common/Button";
import { ARCLogo } from "@/components/deco/ARCLogo";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useActiveUser } from "@/stores/activeUser";

export default function Main() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  useEffect(() => {
    const activeUserApiState = useActiveUser.getState();
    checkTables()
      .then(async (res: CheckTablesReturnSig) => {
        if (res.status === "success" && res.isEmpty) {
          activeUserApiState.setActiveUser({
            hasChecked: true,
            isLoggedIn: false,
            userId: null,
          });
          router.replace("/NewAccountMain/page");
        } else if (res.status === "success" && !res.isEmpty && res.userId) {
          activeUserApiState.setActiveUser({
            hasChecked: true,
            isLoggedIn: true,
            userId: res.userId,
          });
        }
      })
      .catch((e) => {
        ////XLF
        console.log("Something really bad happened", e);
      });
  }, []);

  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini style={{ width: 60, height: 60 }}></ARCLogoMini>
        <ActivityIndicator
          style={{ marginTop: "5%" }}
          color={globalStyle.color}
        ></ActivityIndicator>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
