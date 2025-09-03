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
import { useCallback } from "react";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { Dropdown } from "@/components/deco/Dropdown";
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
  const settingOptions = [
    {
      name: "theme",
      title: "Theme",
      description: "Change the theme of the app",
      goTo: "/settings/accountSettings/themeSettings",
    },
    {
      name: "backup",
      title: "Backup",
      description: "Make a backup of your data",
      goTo: "/settings/accountSettings/backupSettings",
    },
    {
      name: "keyManagement",
      title: "Key Management",
      description: "Manage your account keys",
      goTo: "/settings/accountSettings/accountKeys",
    },
  ];

  const renderItem = useCallback((item: SettingOption) => {
    return (
      <Button
        onClick={() => {
          //@ts-ignore
          router.push(item.goTo);
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
          }}
        >
          <Text style={{ zIndex: -1 }} label={item.title}></Text>
          <Text
            style={{ zIndex: -1 }}
            fontSize={globalStyle.mediumMobileFont}
            label={item.description}
          ></Text>
        </View>
      </Button>
    );
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <View style={{ width: "100%", height: "100%" }}>
          <FlashList
            inverted={true}
            renderItem={({ item }) => renderItem(item)}
            data={settingOptions}
          ></FlashList>
          <SimpleFooter label="Settings / Account Settings"></SimpleFooter>
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
