import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { Selection } from "@/components/common/Selection";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useCallback, useState } from "react";
import Button from "@/components/common/Button";
import { ARCTasksType } from "@/constants/CommonTypes";
import { router } from "expo-router";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";
import { v4 } from "uuid";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { EditDeco } from "@/components/deco/EditDeco";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { TrashIcon } from "@/components/deco/TrashIcon";
import Text from "@/components/common/Text";

function EditActivitiySelection() {
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (s) => s.timeTrackingFeatureConfig,
  );
  const globalStyle = useGlobalStyleStore().globalStyle;
  const [selectionIndex, setSelectionIndex] = useState<number | null>(null);
  const createNewActivity = useCallback(() => {
    const newAcivity: ARCTasksType = {
      itme: {
        taskID: `TID-${v4()}`,
        categoryID: null,
        isSpecialStatus: false,
        routineConfig: {
          enabledDays: [1, 2, 3, 4, 5, 6, 7],
          isActive: false,
          timeConfig: null,
        },
        deleted: false,
        name: "New Activity",
        version: "0.1.0",
      },
      type: "task",
    };

    const dataRetrivalAPI = dataRetrivalApi.getState();

    const updatedTimeTracking = [...timeTrackingFeatureConfig, newAcivity];
    const featureConfigApi = useFeatureConfigs.getState();
    featureConfigApi.setTimeTrackingFeatureConfig(updatedTimeTracking);

    const selectedCategoryToEditApi =
      useTimeTrackingSelectedActivity.getState();

    selectedCategoryToEditApi.setActivityToEdit(newAcivity);

    dataRetrivalAPI
      .appendFeatureConfigEntry("timeTracking", newAcivity)
      .then((r) => {
        router.push("/timeTracking/editActivity/editActivity");
      })
      .catch((e) => {
        console.error("Error creating new activity:", e);
      });
  }, [timeTrackingFeatureConfig]);

  const deleteAcitivty = useCallback(async (activityId: string) => {
    const currentTimeTrackingFeatureConfig =
      useFeatureConfigs.getState().timeTrackingFeatureConfig;

    const deletionRes = await dataRetrivalApi
      .getState()
      .modifyFeatureConfig(
        "timeTracking",
        ["id"],
        activityId,
        undefined,
        "delete",
      );

    if (deletionRes.status === "success") {
      const updatedFC = currentTimeTrackingFeatureConfig.filter(
        (itemFC) => itemFC.itme.taskID !== activityId,
      );
      useFeatureConfigs.getState().setTimeTrackingFeatureConfig(updatedFC);
    }
  }, []);

  const renderItem = useCallback(
    (item) => {
      const activity: ARCTasksType = item.item as ARCTasksType;
      const isSelected = selectionIndex === item.index;
      return (
        <Button
          onLongPress={() => {
            setSelectionIndex(item.index);
          }}
          onClick={() => {
            if (isSelected) {
              setSelectionIndex(null);
            } else {
              const selectedActivityToEditApi =
                useTimeTrackingSelectedActivity.getState();
              selectedActivityToEditApi.setActivityToEdit(activity);
              router.push("/timeTracking/editActivity/editActivity");
            }
          }}
          textStyle={{
            textAlign: "left",
            paddingLeft: 10,
          }}
          style={{
            width: "100%",
            height: 65,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          label={activity.itme?.name}
        >
          {isSelected ? (
            <View
              style={{
                position: "absolute",
                right: 0,
                display: "flex",
                flexDirection: "row",
                height: "100%",
              }}
            >
              <Text
                style={{ marginRight: 12, zIndex: -1 }}
                fontSize={globalStyle.regularMobileFont}
                label="Cancel"
              ></Text>
              <Button
                onClick={() => {
                  setSelectionIndex(null);
                  deleteAcitivty(activity.itme?.taskID);
                }}
                style={{
                  zIndex: 3,
                  width: 80,
                  borderRadius: 0,
                  borderWidth: 0,
                  borderLeftWidth: 1,
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TrashIcon
                  height={25}
                  width={"100%"}
                  color={globalStyle.errorColor}
                ></TrashIcon>
              </Button>
            </View>
          ) : (
            <EditDeco
              color={globalStyle.color}
              width={35}
              height={35}
              style={{ position: "absolute", right: 10, zIndex: -1 }}
            ></EditDeco>
          )}
        </Button>
      );
    },
    [selectionIndex],
  );

  const separator = useCallback(() => {
    return <View style={{ height: 10 }}></View>;
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <ReversedListWithControls
          estimatedItemSize={65}
          showActionButton={true}
          extraData={selectionIndex}
          ItemSeparatorComponent={separator}
          renderItem={(item) => renderItem(item)}
          onActionButtonClick={createNewActivity}
          showSearchBar={true}
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
