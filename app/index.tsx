import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";
import {
  checkTables,
  CheckTablesReturnSig,
} from "@/components/utils/db/checkTables";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useActiveUser } from "@/stores/activeUser";
import SimpleLoadingScreen from "@/components/common/SimpleLoadingScreen";

export default function Main() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  useEffect(() => {
    const activeUserApiState = useActiveUser.getState();
    checkTables()
      .then(async (res: CheckTablesReturnSig) => {
        console.log("XLF UID", res);
        if (res.status === "success" && res.isEmpty) {
          activeUserApiState.setActiveUser({
            hasChecked: true,
            isLoggedIn: false,
            userId: null,
          });
          router.replace("/NewAccountMain/page");
        } else if (res.status === "success" && !res.isEmpty && res.userId) {
          ///PROPER AUTH CHECKS NEEDED HERE. NOT REQUIRED FOR LOCAL ACCOUNTS BUT NEEDED FOR REMOTE ACCOUNTS
          activeUserApiState.setActiveUser({
            hasChecked: true,
            isLoggedIn: true,
            userId: res.userId,
          });
          router.replace("/localAccountAuth/localAccountAuth");
        }
      })
      .catch((e) => {
        ////XLF
        console.log("Something really bad happened", e);
      });
  }, []);

  return <SimpleLoadingScreen></SimpleLoadingScreen>;
}
