import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { Selection } from "@/components/common/Selection";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import { ARCTasksType } from "@/constants/CommonTypes";
import { router } from "expo-router";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";

function EditActivitiySelection() {
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (s) => s.timeTrackingFeatureConfig
  );

  const renderItem = useCallback((item) => {
    const activity: ARCTasksType = item.item as ARCTasksType;
    return (
      <Button
        onClick={() => {
          const selectedActivityToEditApi =
            useTimeTrackingSelectedActivity.getState();
          selectedActivityToEditApi.setActivityToEdit(activity);
          router.push("/timeTracking/editActivity/editActivity");
        }}
        textStyle={{ textAlign: "left", paddingLeft: 10 }}
        style={{ width: "100%", height: 65 }}
        label={activity.itme?.name}
      ></Button>
    );
  }, []);

  const separator = useCallback(() => {
    return <View style={{ height: 5 }}></View>;
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <ReversedListWithControls
          estimatedItemSize={65}
          ItemSeparatorComponent={separator}
          renderItem={(item) => {
            return renderItem(item);
          }}
          showSearchBar={true}
          onSearch={(query) => {}}
          searchKeys={["itme.name"]}
          showBackButton={true}
          onBackButtonClick={() => {
            router.back();
          }}
          data={timeTrackingFeatureConfig.filter((r) => r.type === "task")}
        ></ReversedListWithControls>
      </ThemedView>
    </>
  );
}
export default EditActivitiySelection;

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
