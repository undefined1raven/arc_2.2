import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { Selection } from "@/components/common/Selection";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import { FlashList } from "@shopify/flash-list";
import { SettingdIcon } from "@/components/deco/SettingsIcon";
import { TimeStatsIcon } from "@/components/deco/TimeStatsIcon";
import { DayPlannerIcon } from "@/components/deco/DayPlannerIcon";
import { PersonalDiaryIcon } from "@/components/deco/PersonalDiaryIcon";
import * as NavigationBar from "expo-navigation-bar";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import themeColors, {
  layoutCardLikeBackgroundOpacity,
  themeColorKeyToDisplayName,
} from "@/constants/colors";
import { Dropdown } from "@/components/deco/Dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserThemeKey } from "@/components/utils/constants/secureStoreKeyNames";
import { useActiveUser } from "@/stores/activeUser";
import { HexDeco } from "@/components/deco/HexDeco";
import { SimpleFooter } from "@/components/common/SimpleFooter";
function AccountSettingsMain() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  type SettingOption = {
    name: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    goTo: string;
  };
  const availableThemes = Object.keys(themeColors).map((key) => {
    const colorSet =
      themeColors[key as keyof typeof themeColors][globalStyle.theme];
    const primaryColor = colorSet.color;
    const secondaryColor = colorSet.colorAccent;
    const successColor = colorSet.successColor;
    const errorColor = colorSet.errorColor;
    const backgroundColor = colorSet.pageBackgroundColors[0];
    return {
      name: key,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      primaryColor,
      secondaryColor,
      successColor,
      errorColor,
      backgroundColor,
    };
  });

  const renderItem = useCallback(
    (item) => {
      const isSelected = globalStyle.colorScheme === item.name;

      return (
        <Button
          onClick={() => {
            const globalStyleApi = useGlobalStyleStore.getState();

            const theme = globalStyle.theme;

            //@ts-ignore
            const colorSet = themeColors[item.name][theme];

            NavigationBar.setBackgroundColorAsync(
              colorSet.pageBackgroundColors[1],
            );

            const userId = useActiveUser.getState().activeUser?.userId;

            if (typeof userId !== "string") {
              return;
            }

            console.log(
              "Saving user theme:",
              item.name,
              getUserThemeKey(userId),
            );

            AsyncStorage.setItem(getUserThemeKey(userId), item.name)
              .then((r) => {
                console.log("User theme saved:", r);
              })
              .catch((error) => {
                console.error("Error saving user theme:", error);
              });

            globalStyleApi.updateGlobalStyle({
              ...globalStyle,
              colorScheme: item.name,
              ...colorSet,
            });
          }}
          style={{
            width: "100%",
            height: 93,
            marginBottom: 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 10,
            paddingLeft: 10,
            paddingRight: 5,
          }}
        >
          <View
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Text
              style={{ zIndex: -1 }}
              label={themeColorKeyToDisplayName[item.name]}
            ></Text>
            <View
              style={{
                height: 35,
                padding: 5,
                width: 140,
                zIndex: -1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 5,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: 35,
                  borderRadius: globalStyle.borderRadius,
                  backgroundColor: item.backgroundColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  zIndex: 5,
                  borderRadius: globalStyle.borderRadius,
                  width: 45,
                  backgroundColor: item.primaryColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  zIndex: 5,
                  borderRadius: globalStyle.borderRadius,
                  width: 20,
                  backgroundColor: item.secondaryColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  borderRadius: globalStyle.borderRadius,
                  width: 20,
                  zIndex: 5,
                  backgroundColor: item.successColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  borderRadius: globalStyle.borderRadius,
                  width: 20,
                  zIndex: 5,
                  backgroundColor: item.errorColor,
                }}
              ></View>
            </View>
          </View>
          {isSelected && (
            <View
              style={{ position: "absolute", right: 10, height: 30, width: 30 }}
            >
              <HexDeco
                color={globalStyle.color}
                height={30}
                width={30}
              ></HexDeco>
            </View>
          )}
        </Button>
      );
    },
    [globalStyle],
  );

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <View style={{ width: "100%", height: "100%" }}>
          <FlashList
            inverted={true}
            estimatedItemSize={100}
            renderItem={({ item }) => renderItem(item)}
            data={availableThemes}
          ></FlashList>
          <SimpleFooter label="Settings / Account Settings / Theme"></SimpleFooter>
        </View>
      </ThemedView>
    </>
  );
}
export default AccountSettingsMain;

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
