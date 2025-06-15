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
function TimeTrackingSettingsMain() {
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
      name: "activities",
      title: "Activities",
      description: "Add, remove and edit your activities",
      goTo: "/timeTracking/editActivity/editActivitySelection",
    },
    {
      name: "categories",
      title: "Categories",
      description: "Add, remove and edit your categories",
      goTo: "/timeTracking/editCategory/editCategorySelection",
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
          <Text
            textAlign="left"
            label="Settings / Time Tracking Settings"
            style={{
              flexShrink: 0,
              width: "100%",
              height: 65,
              paddingLeft: 90,
              backgroundColor:
                globalStyle.color + layoutCardLikeBackgroundOpacity,
            }}
          ></Text>
          <Button
            onClick={() => {
              router.back();
            }}
            style={{
              borderRadius: 0,
              borderWidth: 0,
              borderRightWidth: 1,
              position: "absolute",
              bottom: 0,
              width: 80,
              height: 65,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Dropdown style={{ transform: [{ rotate: "90deg" }] }}></Dropdown>
          </Button>
        </View>
      </ThemedView>
    </>
  );
}
export default TimeTrackingSettingsMain;

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
