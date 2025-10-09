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
function SettingsMain() {
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
      name: "timeTracking",
      icon: TimeStatsIcon,
      title: "Activities and categories",
      description: "Add, remove and categorize your activities",
      goTo: "timeTracking/timeTrackingSettingsMain",
    },
    {
      name: "dayPlanner",
      icon: DayPlannerIcon,
      title: "Customize day planner",
      description: "Change colors",
      goTo: "/dayPlanner/statusEditor/statusEditor",
    },
    {
      name: "personalDiary",
      icon: PersonalDiaryIcon,
      title: "Personal diary",
      description: "Access control",
      goTo: "/diary/diaryFeatureConfig/diaryFeatureConfig",
    },
    {
      name: "accountSettings",
      icon: SettingdIcon,
      title: "Account settings",
      description: "Theme, security, and general settings",
      goTo: "/settings/accountSettings/accountSettingsMain",
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
        <item.icon width={30} height={30} />
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
            estimatedItemSize={100}
            inverted={true}
            renderItem={({ item }) => renderItem(item)}
            data={settingOptions}
          ></FlashList>
        </View>
      </ThemedView>
    </>
  );
}
export default SettingsMain;

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
