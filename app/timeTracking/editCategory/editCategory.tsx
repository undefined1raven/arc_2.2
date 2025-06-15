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
function EditCategory() {
  const categoryToEdit = useTimeTrackingSelectedActivity(
    (s) => s.categoryToEdit
  );
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (s) => s.timeTrackingFeatureConfig
  );
  const updateAcitivty = useCallback(
    debounce((updatedCategory: ARCTasksType) => {
      const featureConfigApi = useFeatureConfigs.getState();
      const dataRetrivalAPI = dataRetrivalApi.getState();
      if (categoryToEdit === null) return;
      let idKey = "categoryID";
      if (typeof categoryToEdit?.itme.categoryID === "undefined") {
        idKey = "id";
      }
      dataRetrivalAPI
        .modifyFeatureConfig(
          "timeTracking",
          ["itme", idKey],
          updatedCategory.itme[idKey],
          updatedCategory,
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
          if (fcItem.itme[idKey] === updatedCategory.itme[idKey]) {
            return updatedCategory;
          }
          return fcItem;
        });
      featureConfigApi.setTimeTrackingFeatureConfig(
        updatedTimeTrackingFeatureConfig
      );
    }, 300),
    [categoryToEdit]
  );

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {categoryToEdit === null ? (
          <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
        ) : (
          <FeatureConfigEmptySettingPage
            bototmHeaderLabel="Edit category"
            bottomHeaderButtonOnPress={() => {
              router.replace("/timeTracking/timeTrackingSettingsMain");
            }}
          >
            <FeatureConfigValueInput
              inputType="text"
              onChange={(newName: string) => {
                if (categoryToEdit === null) return;
                const updatedCategory: ARCCategoryType = {
                  ...categoryToEdit,
                  itme: {
                    ...categoryToEdit.itme,
                    name: newName,
                  },
                };
                updateAcitivty(updatedCategory);
              }}
              label="Name"
              value={categoryToEdit?.itme.name}
            ></FeatureConfigValueInput>
          </FeatureConfigEmptySettingPage>
        )}
      </ThemedView>
    </>
  );
}
export default EditCategory;

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
