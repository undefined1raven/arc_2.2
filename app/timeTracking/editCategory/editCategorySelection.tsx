import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import { ARCCategoryType, ARCTasksType } from "@/constants/CommonTypes";
import { router } from "expo-router";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";
import { v4 } from "uuid";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";

function EditCategorySelection() {
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (s) => s.timeTrackingFeatureConfig
  );

  const createNewCategory = useCallback(() => {
    const newCategory: ARCCategoryType = {
      itme: {
        categoryID: `CID-${v4()}`,
        deleted: false,
        name: `New Category ${Date.now()}`,
        version: "0.1.0",
      },
      type: "taskCategory",
    };

    const dataRetrivalAPI = dataRetrivalApi.getState();

    const updatedTimeTracking = [...timeTrackingFeatureConfig, newCategory];
    const featureConfigApi = useFeatureConfigs.getState();
    featureConfigApi.setTimeTrackingFeatureConfig(updatedTimeTracking);

    const selectedCategoryToEditApi =
      useTimeTrackingSelectedActivity.getState();

    selectedCategoryToEditApi.setCategoryToEdit(newCategory);

    dataRetrivalAPI
      .appendFeatureConfigEntry("timeTracking", newCategory)
      .then((r) => {
        router.push("/timeTracking/editCategory/editCategory");
      })
      .catch((e) => {
        console.error("Error creating new activity:", e);
      });
  }, [timeTrackingFeatureConfig]);

  const renderItem = useCallback((item) => {
    const category: ARCCategoryType = item.item as ARCCategoryType;
    return (
      <Button
        onClick={() => {
          const selectedActivityToEditApi =
            useTimeTrackingSelectedActivity.getState();
          selectedActivityToEditApi.setCategoryToEdit(category);
          router.push("/timeTracking/editCategory/editCategory");
        }}
        textStyle={{ textAlign: "left", paddingLeft: 10 }}
        style={{ width: "100%", height: 65 }}
        label={category.itme?.name}
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
          extraData={timeTrackingFeatureConfig.length}
          estimatedItemSize={65}
          showActionButton={true}
          onActionButtonClick={createNewCategory}
          ItemSeparatorComponent={separator}
          renderItem={(item) => {
            return renderItem(item);
          }}
          showSearchBar={true}
          onSearch={(query) => {}}
          searchKeys={["itme.name"]}
          showBackButton={false}
          onBackButtonClick={() => {
            router.back();
          }}
          data={timeTrackingFeatureConfig.filter(
            (r) => r.type === "taskCategory"
          )}
        ></ReversedListWithControls>
      </ThemedView>
    </>
  );
}
export default EditCategorySelection;

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
