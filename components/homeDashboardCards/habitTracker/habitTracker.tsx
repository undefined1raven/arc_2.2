import { useHabitCardDataApi } from "@/stores/viewState/habitCardData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActiveUser } from "@/stores/activeUser";
import { Selection } from "@/components/common/Selection";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import Button from "@/components/common/Button";
import { EditDeco } from "@/components/deco/EditDeco";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Text from "@/components/common/Text";
import { HabitTrackerList } from "./habitTrackerList";

function HabitTracker() {
  const timeTrackingFC = useFeatureConfigs(
    (state) => state.timeTrackingFeatureConfig,
  );
  const {
    hasLoadedData,
    derivedData,
    hasTrackedIds,
    trackedIds: trackedHabitIds,
  } = useHabitCardDataApi();

  const { globalStyle } = useGlobalStyleStore();

  const activitiesLabelWidth = 35;
  const dayLabels = useMemo(() => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const today = new Date().getDay();
    const result = [];

    for (let i = 7; i > 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      result.push(days[dayIndex]);
    }

    return result;
  }, []);

  // Memoized selection handler
  const handleSelection = useCallback(async (taskIds: string[]) => {
    const stringified = JSON.stringify(taskIds);
    const activeUserId = useActiveUser.getState().activeUser?.userId;
    const habitDataApi = useHabitCardDataApi.getState();
    const existingIds = habitDataApi.trackedIds;

    if (
      Array.isArray(existingIds) &&
      existingIds.length === taskIds.length &&
      existingIds.every((id, index) => id === taskIds[index])
    ) {
      return; // No change in selection
    }

    habitDataApi.setTrackedIds(taskIds);
    if (!activeUserId) return;
    try {
      await AsyncStorage.setItem(`${activeUserId}-habitCardData`, stringified);
    } catch (error) {
      console.error("Error saving habit card data:", error);
    }
  }, []);

  // Memoized filtered tasks
  const filteredTasks = useMemo(
    () => timeTrackingFC.filter((r) => r.type === "task"),
    [timeTrackingFC],
  );

  ///Render loading state
  if (
    hasTrackedIds === false ||
    (hasTrackedIds === true && derivedData === null && hasLoadedData === false)
  ) {
    return (
      <View
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          borderTopWidth: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={globalStyle.color} />
      </View>
    );
  }

  ///Render no tracked habits selected state
  if (
    hasTrackedIds === true &&
    (trackedHabitIds === null || trackedHabitIds?.length === 0)
  ) {
    return (
      <View
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          borderTopWidth: 0,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 15,
        }}
      >
        <Text
          fontSize={globalStyle.mediumMobileFont}
          label="No activities selected to track"
        ></Text>
        <Selection
          key={JSON.stringify(trackedHabitIds)}
          onMultiSelection={handleSelection}
          values={filteredTasks || []}
          labelKeys={["itme", "name"]}
          multiselectMatchKeys={["itme", "taskID"]}
          value={trackedHabitIds}
          multiselect={true}
          customSelectionButton={(props: { onClick: () => void }) => (
            <Button
              onClick={props.onClick}
              fontSize={globalStyle.mediumMobileFont}
              style={{ width: "70%", height: 40 }}
              label="Pick activities"
            ></Button>
          )}
        />
      </View>
    );
  }

  ///Render habit tracker
  return (
    <View
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
      }}
    >
      <View
        style={{
          height: "23%",
          maxHeight: 35,
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          paddingLeft: 5,
          paddingRight: 5,
          top: 0,
        }}
      >
        <Text
          fontSize={12}
          style={{ maxWidth: "58%", textAlign: "left" }}
          label="Activity Streaks"
        ></Text>
        <View
          style={{
            width: "40%",
            height: "80%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Selection
            key={JSON.stringify(trackedHabitIds)}
            onMultiSelection={handleSelection}
            values={filteredTasks || []}
            labelKeys={["itme", "name"]}
            multiselectMatchKeys={["itme", "taskID"]}
            value={trackedHabitIds}
            multiselect={true}
            customSelectionButton={(props: { onClick: () => void }) => (
              <Button
                onClick={props.onClick}
                backgroundColor={globalStyle.colorAccent + "15"}
                style={{
                  width: "50%",
                  height: "100%",
                  display: "flex",

                  justifyContent: "center",
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  alignItems: "center",
                }}
              >
                <EditDeco />
              </Button>
            )}
          />
        </View>
      </View>
      <View
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 5,
          paddingRight: 5,
        }}
      >
        <View style={{ flex: 1, width: "100%" }}>
          <HabitTrackerList
            activitiesLabelWidth={activitiesLabelWidth}
          ></HabitTrackerList>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            height: 32,
            width: "100%",
            borderTopColor: globalStyle.color + "40",
            borderTopWidth: 1,
          }}
        >
          <View
            style={{
              width: `${activitiesLabelWidth}%`,
              height: "100%",
              borderColor: globalStyle.color + "40",
              borderRightWidth: 1,
            }}
          ></View>
          <View
            style={{
              width: `${100 - activitiesLabelWidth}%`,
              height: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: 5,
              paddingRight: 5,
            }}
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <View
                key={index}
                style={{
                  height: 26,
                  aspectRatio: 1,
                  borderRadius: 5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: globalStyle.color + "30",
                }}
              >
                <Text
                  color={globalStyle.textColorAccent}
                  label={dayLabels[index]}
                  fontSize={15}
                ></Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export { HabitTracker };
