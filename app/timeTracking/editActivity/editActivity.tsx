import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { router } from "expo-router";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { useCallback } from "react";
import { ARCCategoryType, ARCTasksType } from "@/constants/CommonTypes";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { debounce } from "lodash";
import { Selection } from "@/components/common/Selection";
import { FeatureConfigSelection } from "@/components/ui/FeatureConfigSelection";
function EditActivity() {
  const activityToEdit = useTimeTrackingSelectedActivity(
    (s) => s.activityToEdit
  );
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (s) => s.timeTrackingFeatureConfig
  );
  const updateAcitivty = useCallback(
    debounce((updatedActivity: ARCTasksType) => {
      const featureConfigApi = useFeatureConfigs.getState();
      const dataRetrivalAPI = dataRetrivalApi.getState();
      if (activityToEdit === null) return;
      dataRetrivalAPI
        .modifyFeatureConfig(
          "timeTracking",
          ["itme", "taskID"],
          updatedActivity.itme.taskID,
          updatedActivity,
          "replace"
        )
        .catch((error) => {
          console.error("Failed to update activity:", error);
        })
        .then((r) => {
          console.log("Activity updated successfully:", r);
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
    }, 300),
    [activityToEdit]
  );

  const getCategoryForActivity = useCallback(
    (activity: ARCTasksType) => {
      const categoryId = activity.itme.categoryID;
      if (!categoryId) return "Unknown Category";
      const category = timeTrackingFeatureConfig?.find((item: any) => {
        const match = item.itme.categoryID === categoryId;
        if (match) {
          return item;
        }
        const legacyMatch = item.itme.id === categoryId;
        if (legacyMatch) {
          return item;
        }
        return false;
      });
      return category ? category : "Unknown Category";
    },
    [timeTrackingFeatureConfig]
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
            <FeatureConfigSelection
              label="Category"
              inputProps={{ selectionBoxStyle: { width: "100%" } }}
              labelKeys={["itme", "name"]}
              values={timeTrackingFeatureConfig.filter(
                (item: any) => item.type === "taskCategory"
              )}
              value={getCategoryForActivity(activityToEdit)}
              onChange={(category: ARCCategoryType) => {
                const updatedActivity: ARCTasksType = {
                  ...activityToEdit,
                  itme: {
                    ...activityToEdit.itme,
                    categoryID: category.itme.categoryID || category.itme.id,
                  },
                };
                const timeTrackingSelectedActivityApi =
                  useTimeTrackingSelectedActivity.getState();
                timeTrackingSelectedActivityApi.setActivityToEdit(
                  updatedActivity
                );

                updateAcitivty(updatedActivity);
              }}
            ></FeatureConfigSelection>
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
