import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { router } from "expo-router";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { useCallback } from "react";
import { ARCTasksType } from "@/constants/CommonTypes";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
function EditActivity() {
  const activityToEdit = useTimeTrackingSelectedActivity(
    (s) => s.activityToEdit
  );
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  const updateAcitivty = useCallback(
    (updatedActivity: ARCTasksType) => {
      const featureConfigApi = useFeatureConfigs.getState();
      const dataRetrivalAPI = dataRetrivalApi.getState();
      if (activityToEdit === null) return;

      dataRetrivalAPI
        .modifyFeatureConfig(
          "timeTracking",
          ["itme", "taskID"],
          updatedActivity.itme.taskID,
          updatedActivity
        )
        .catch((error) => {
          console.error("Failed to update activity:", error);
        });

      const updatedTimeTrackingFeatureConfig =
        featureConfigApi.timeTrackingFeatureConfig.map((fcItem: any) => {
          if (fcItem.itme.taskID === updatedActivity.itme.taskID) {
            return updatedActivity;
          }
          return fcItem;
        });
      featureConfigApi.setTimeTrackingFeatureConfig(
        updatedTimeTrackingFeatureConfig
      );
    },
    [activityToEdit]
  );

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {activityToEdit === null ? (
          <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
        ) : (
          <FeatureConfigEmptySettingPage
            bototmHeaderLabel="Edit activity"
            bottomHeaderButtonOnPress={() => {
              router.back();
            }}
          >
            <FeatureConfigValueInput
              inputType="text"
              onChange={(newName: string) => {
                if (activityToEdit === null) return;
                const updatedActivity: ARCTasksType = {
                  ...activityToEdit,
                  itme: {
                    ...activityToEdit.itme,
                    name: newName,
                  },
                };
                updateAcitivty(updatedActivity);
              }}
              label="Name"
              value={activityToEdit?.itme.name}
            ></FeatureConfigValueInput>
          </FeatureConfigEmptySettingPage>
        )}
      </ThemedView>
    </>
  );
}
export default EditActivity;

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
