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
import { useEffect } from "react";
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
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navMenuApi = useNavMenuApi();
  const pathname = usePathname();

  const navMenuDisallowedPaths = [
    "/NewAccountMain/page",
    "/login/localLogin/localLogin",
    "/downloadRecoveryCodes/page",
    "/setAccountPin/page",
    "/localAccountAuth/localAccountAuth",
    "/timeTrackingFeatureConfig/EditActivities",
    "/activeDayView/activeDayView",
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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      NavigationBar.setBackgroundColorAsync(
        globalStyle.pageBackgroundColors[1]
      );
      NavigationBar.setButtonStyleAsync("dark");
      NavigationBar.setPositionAsync("absolute");
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <SQLiteProvider databaseName="localCache">
        <SafeAreaView style={{ flex: 1 }}>
          <GestureHandlerRootView
            style={{
              flex: 1,
              backgroundColor: globalStyle.pageBackgroundColors[0],
            }}
          >
            <CreateNewAccountData></CreateNewAccountData>
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
              <Stack.Screen name="home/home" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
            <StatusIndicators></StatusIndicators>
            {navMenuApi.showMenu &&
              navMenuDisallowedPaths.includes(pathname) === false && (
                <NavMenuBar></NavMenuBar>
              )}
          </GestureHandlerRootView>
        </SafeAreaView>
      </SQLiteProvider>
    </>
  );
}
