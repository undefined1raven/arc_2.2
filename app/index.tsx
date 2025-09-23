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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useActiveUser } from "@/stores/activeUser";
import SimpleLoadingScreen from "@/components/common/SimpleLoadingScreen";
import { getUserThemeKey } from "@/components/utils/constants/secureStoreKeyNames";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import themeColors from "@/constants/colors";

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
            accountType: null,
          });
          SplashScreen.hideAsync();
          router.replace("/NewAccountMain/page");
        } else if (res.status === "success" && !res.isEmpty && res.userId) {
          ///PROPER AUTH CHECKS NEEDED HERE. NOT REQUIRED FOR LOCAL ACCOUNTS BUT NEEDED FOR REMOTE ACCOUNTS

          AsyncStorage.getItem(getUserThemeKey(res.userId))
            .then((colorSetName) => {
              console.log("User theme color set name:", colorSetName);

              if (colorSetName === null) {
                SplashScreen.hideAsync();
              }
              const userTheme = globalStyle.theme;
              //@ts-ignore
              const colorSet = themeColors[colorSetName][userTheme];
              const globalStyleApi = useGlobalStyleStore.getState();
              globalStyleApi.updateGlobalStyle({
                ...globalStyle,
                ...colorSet,
                colorScheme: colorSetName,
              });

              NavigationBar.setBackgroundColorAsync(
                colorSet.pageBackgroundColors[1]
              );
              SplashScreen.hideAsync();
            })
            .catch((error) => {
              console.log("Error getting user theme:", error);
              SplashScreen.hideAsync();
            });

          activeUserApiState.setActiveUser({
            hasChecked: true,
            isLoggedIn: true,
            userId: res.userId,
            accountType: res.accountType,
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
