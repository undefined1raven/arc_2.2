import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import { ARCCategoryType, ARCTasksType } from "@/constants/CommonTypes";
import { router } from "expo-router";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";

function EditCategorySelection() {
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (s) => s.timeTrackingFeatureConfig
  );

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
          extraData={timeTrackingFeatureConfig}
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
