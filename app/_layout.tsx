import { useGlobalStyleStore } from "@/stores/globalStyles";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { act, useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { CryptoWorkers } from "@/components/utils/CryptoWorkers";
import CreateNewAccountData from "@/components/functional/CreateNewAccountData";
import { SQLiteProvider } from "expo-sqlite";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { StatusIndicators } from "@/components/ui/StatusIndicators";
import KeyboardVisible from "@/components/functional/KeyboardStatus";
import { Host, Portal } from "react-native-portalize";
import { useActiveUser } from "@/stores/activeUser";
import { OnlineSyncHandler } from "@/components/functional/OnlineSyncHandler";
import { HashColumnMigration } from "@/components/utils/db/migrations/HashColumnMigration";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { initialDataSync } from "@/components/utils/api/initialDataSync";
import { useTransferStore } from "@/stores/dataSyncApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CriticalSyncOverlay } from "./dataDownloadScreen/dataDownloadOverlay";
import { onLoginOnce } from "./functions/onLoginOnce";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navMenuApi = useNavMenuApi();
  const pathname = usePathname();
  const activeUserAccountType = useActiveUser(
    (state) => state?.activeUser?.accountType ?? null,
  );

  const navMenuDisallowedPaths = [
    "/NewAccountMain/page",
    "/login/localLogin/localLogin",
    "/login/localLogin/passphrasePage",
    "/login/localLogin/pinPage",
    "/downloadRecoveryCodes/page",
    "/setAccountPin/page",
    "/localAccountAuth/localAccountAuth",
    "/timeTrackingFeatureConfig/EditActivities",
    "/activeDayView/activeDayView",
    "/dayPlanner/statusEditor/statusEditor",
    "/diary/groupView/groupMain",
    "/diary/diaryNoteView/diaryNoteView",
    "/diary/diaryGroupConfig/diaryGroupConfig",
    "/timeTracking/editActivity/editActivity",
    "/settings/accountSettings/accountSettingsMain",
    "/settings/accountSettings/themeSettings",
    "/timeTracking/timeTrackingSettingsMain",
    "/timeTracking/editActivity/editActivitySelection",
    "/timeTracking/editCategory/editCategorySelection",
    "/timeTracking/editCategory/editCategory",
    "/settings/accountSettings/backupSettings",
    "/settings/accountSettings/accountKeys",
    "/timeTrackingStats/statsDayView/timeTrackingDayView",
    "/timeTrackingStats/dataExplorer/timeTrackingDataExplorer",
    "/secretKey/page",
    "/settings/keyRegenerationFlow/newPinPage",
    "/settings/keyRegenerationFlow/newRecoveryCodes",
    "/settings/keyRegenerationFlow/newPassphrasePage",
    "/settings/accountSettings/accountType",
    "/dayPlanner/historicDayView",
    "/diary/diaryFeatureConfig/diaryFeatureConfig",
  ];

  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const [loaded] = useFonts({
    OxaniumVar: require("../assets/fonts/Oxanium-VariableFont_wght.ttf"),
    OxaniumRegular: require("../assets/fonts/Oxanium-Regular.ttf"),
    OxaniumLight: require("../assets/fonts/Oxanium-Light.ttf"),
    OxaniumMedium: require("../assets/fonts/Oxanium-Medium.ttf"),
    OxaniumSemiBold: require("../assets/fonts/Oxanium-SemiBold.ttf"),
    OxaniumBold: require("../assets/fonts/Oxanium-Bold.ttf"),
  });

  const activeUserId = useActiveUser((state) => state.activeUser.userId);
  const symKey = useActiveKeys((state) => state.activeSymmetricKey);
  const timeTrackingFeatureConifg = useFeatureConfigs(
    (state) => state.timeTrackingFeatureConfig,
  );

  const tasks = useTransferStore((state) => state.tasks);

  useEffect(() => {
    if (tasks.length > 0) {
      AsyncStorage.setItem(
        "lastSync",
        JSON.stringify(
          tasks.map((t) => {
            delete t.payload;
            return t;
          }),
        ),
      );
    }
  }, [tasks]);

  useEffect(() => {
    if (loaded) {
      NavigationBar.setPositionAsync("absolute");
    }
  }, [loaded]);

  useEffect(() => {
    if (
      activeUserId &&
      loaded &&
      typeof symKey === "string" &&
      timeTrackingFeatureConifg !== null
    ) {
      onLoginOnce();
    }
  }, [activeUserId, symKey, timeTrackingFeatureConifg]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Host>
        <SQLiteProvider databaseName="localCache">
          <SafeAreaView style={{ flex: 1 }}>
            <GestureHandlerRootView
              style={{
                flex: 1,
                backgroundColor: globalStyle.pageBackgroundColors[0],
              }}
            >
              <CriticalSyncOverlay></CriticalSyncOverlay>

              <CreateNewAccountData></CreateNewAccountData>
              <KeyboardVisible></KeyboardVisible>
              <View style={{ width: 0, height: 0 }}>
                <CryptoWorkers></CryptoWorkers>
              </View>
              <LinearGradient
                colors={globalStyle.pageBackgroundColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 0.7 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "120%",
                  height: "120%",
                }}
              ></LinearGradient>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="NewAccountMain/page"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="downloadRecoveryCodes/page"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="setAccountPin/page"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="localAccountAuth/localAccountAuth"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="login/localLogin/localLogin"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="login/localLogin/passphrasePage"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="login/localLogin/pinPage"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTrackingFeatureConfig/EditActivities"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="dayPlanner/dayPlanner"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="activeDayView/activeDayView"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="dayPlanner/statusEditor/statusEditor"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTrackingStats/statsHome/statsHome"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="diary/diaryMain/diaryMain"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="diary/groupView/groupMain"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="diary/diaryNoteView/diaryNoteView"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="diary/diaryGroupConfig/diaryGroupConfig"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTracking/editActivity/editActivity"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTracking/editCategory/editCategory"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="home/home"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/settingsMain"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/accountSettings/accountSettingsMain"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/accountSettings/themeSettings"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/accountSettings/backupSettings"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/accountSettings/accountKeys"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/keyRegenerationFlow/newRecoveryCodes"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/keyRegenerationFlow/newPinPage"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTracking/timeTrackingSettingsMain"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTracking/editActivity/editActivitySelection"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTracking/editCategory/editCategorySelection"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTrackingStats/statsDayView/timeTrackingDayView"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="timeTrackingStats/dataExplorer/timeTrackingDataExplorer"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/keyRegenerationFlow/newPassphrasePage"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="secretKey/page"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/accountSettings/accountType"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="settings/devInfo/devInfoMain"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="dayPlanner/historicDayView"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="diary/diaryFeatureConfig/diaryFeatureConfig"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="diary/diaryFeatureConfig/diaryFeatureConfigEdit"
                  options={{ headerShown: false }}
                />
              </Stack>
              <StatusBar style="auto" />
              <StatusIndicators></StatusIndicators>

              {activeUserAccountType === "online" && (
                <OnlineSyncHandler></OnlineSyncHandler>
              )}
              {navMenuApi.showMenu &&
                navMenuDisallowedPaths.includes(pathname) === false && (
                  <NavMenuBar></NavMenuBar>
                )}
            </GestureHandlerRootView>
          </SafeAreaView>
        </SQLiteProvider>
      </Host>
    </>
  );
}
