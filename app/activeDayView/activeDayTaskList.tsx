import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { AddIcon } from "@/components/deco/AddIcon";
import { dayPlannerTaskStatusColorRetrieval } from "@/components/utils/dataProcessing/dayPlannerTaskStatusColorRetrieval";
import {
  FeatureConfigTessType,
  TessDayLogType,
  TessStatusType,
} from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useDayPlannerTaskToEdit } from "@/stores/viewState/dayPlannerTaskToEdit";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { Animated, View } from "react-native";
import { FadeIn } from "react-native-reanimated";
import { v4 } from "uuid";
function ActiveDayTaskList() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const activeDay = useDayPlannerActiveDay((state) => state.activeDay);
  const dayPlannerFeatureConfig: FeatureConfigTessType = useFeatureConfigs(
    (s) => s.dayPlannerFeatureConfig,
  );
  const dayPlannerRecentDaysApi = useDayPlannerActiveDay();
  const dataRetriavalAPI = dataRetrivalApi();
  const dayPlannerTaskToEdit = useDayPlannerTaskToEdit();
  const updateRecentDaysWithUpdatedDay = useCallback(
    (updatedDay: TessDayLogType) => {
      const currentRecentDays = useDayPlannerActiveDay.getState().recentDays;
      if (Array.isArray(currentRecentDays) === false) {
        return;
      }
      const newDayPlannerRecentDays = [...currentRecentDays];
      const newDate = new Date();
      const formattedTodayDate = newDate.toDateString();

      const currentDayIndex = newDayPlannerRecentDays.findIndex(
        (dayLog) => dayLog.day === formattedTodayDate,
      );

      if (currentDayIndex === -1) {
        return;
      } else {
        newDayPlannerRecentDays.splice(currentDayIndex, 1, updatedDay);
        dayPlannerRecentDaysApi.setRecentDays(newDayPlannerRecentDays);
      }
    },
    [],
  );

  const addTaskToDay = useCallback(() => {
    if (
      activeDay === undefined ||
      activeDay === null ||
      typeof activeDay.tasks.length !== "number"
    ) {
      return;
    }
    let defaultStatusId: string | undefined = dayPlannerFeatureConfig.find(
      (status: TessStatusType) => status.name === "To Do",
    )?.statusID;
    if (!defaultStatusId) {
      defaultStatusId = dayPlannerFeatureConfig[0].statusID;
    }

    const newTask: TessDayLogType["tasks"][number] = {
      name: "New Task",
      description: "",
      TTID: `T-${v4()}`,
      statusID: defaultStatusId,
      labels: [],
      doRemind: false,
      start: Date.now(),
      end: Date.now(),
      deleted: false,
      version: "0.1.0",
    };
    const allTasks = [...activeDay.tasks, newTask];
    const newDay: TessDayLogType = {
      ...activeDay,
      tasks: allTasks,
    };
    useDayPlannerActiveDay.getState().setActiveDay(newDay);
    updateRecentDaysWithUpdatedDay(newDay);
    dataRetriavalAPI
      .modifyEntry(
        "dayPlannerChunks",
        ["day"],
        newDay.day,
        newDay,
        undefined,
        "replace",
      )
      .then((r) => {
        console.log("Day updated", r);
      })
      .catch((e) => {
        console.error("Error updating day", e);
      });
  }, [activeDay, dayPlannerFeatureConfig]);

  const taskRenderItem = useCallback(
    (taskObj: { item: TessDayLogType["tasks"][number] }, index: number) => {
      const task = taskObj.item;
      const taskStatusId = task.statusID;
      const currentStatus = dayPlannerFeatureConfig.find(
        (status) => status.statusID === taskStatusId,
      );

      const colorsObj = dayPlannerTaskStatusColorRetrieval(task);
      const labels = task.labels ? task.labels : [];
      const isHighPrio = labels.includes("highPriority");
      if (currentStatus === undefined) {
        return <></>;
      }

      const { name: statusName, completionEffect } = currentStatus;
      const isCompletedHighPrioTask =
        completionEffect >= 1 && isHighPrio === true;

      let taskBorderColor = colorsObj.color;
      if (isHighPrio === true) {
        if (isCompletedHighPrioTask) {
          taskBorderColor = globalStyle.successColor;
        } else {
          taskBorderColor = globalStyle.errorColor;
        }
      }

      return (
        <View
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderColor: taskBorderColor,
            borderRadius: globalStyle.borderRadius,
            width: "100%",
            height: 62,
            marginTop: index === 0 ? 0 : 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: taskBorderColor + "30",
          }}
        >
          <Button
            backgroundColor="transparent"
            onClick={() => {
              dayPlannerTaskToEdit.setTaskToEdit(task);
              router.navigate("/activeDayView/taskEditorView");
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 2,
              borderColor: "#00000000",
            }}
          ></Button>
          <View
            style={{
              width: "66%",
              flex: 2,
              height: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
              paddingLeft: 15,
              gap: 15,
            }}
          >
            {isHighPrio && (
              <View
                style={{
                  width: 35,
                  height: "35%",
                  backgroundColor: isCompletedHighPrioTask
                    ? globalStyle.successColor
                    : globalStyle.errorColor,
                  borderRadius: globalStyle.borderRadius,
                }}
              ></View>
            )}
            <View
              style={{
                display: "flex",
                flex: 1,
                height: "100%",
                alignItems: "flex-start",
                justifyContent: "center",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <Text
                color={isHighPrio ? taskBorderColor : colorsObj.textColor}
                label={task.name}
              ></Text>
              {isHighPrio && (
                <Text
                  color={taskBorderColor}
                  fontSize={globalStyle.mediumMobileFont}
                  label={"High Priority"}
                ></Text>
              )}
            </View>
          </View>
          <View
            style={{
              width: "34%",
              flex: 1,
              alignItems: "flex-end",
              justifyContent: "center",
              height: "100%",
              paddingRight: 15,
            }}
          >
            <Text
              fontSize={globalStyle.mediumMobileFont}
              color={isHighPrio ? taskBorderColor : colorsObj.textColor}
              label={statusName}
            ></Text>
          </View>
        </View>
      );
    },
    [dayPlannerFeatureConfig, dayPlannerTaskToEdit.setTaskToEdit],
  );

  if (activeDay === null) {
    return <></>;
  }

  return (
    <Animated.View
      style={{ width: "100%", flex: 1, height: "100%", marginBottom: 10 }}
    >
      <Button
        onClick={() => {
          addTaskToDay();
        }}
        backgroundColor={globalStyle.colorAccent + "15"}
        style={{
          position: "absolute",
          bottom: 5,
          zIndex: 2,
          right: 5,
          height: 35,
          width: 100,
          display: "flex",
          flex: 1,
          justifyContent: "center",
          borderTopWidth: 0,
          borderBottomWidth: 0,
          alignItems: "center",
        }}
      >
        <AddIcon width={18} height={18}></AddIcon>
      </Button>
      <View
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <FlashList
          keyExtractor={(item) => item.TTID}
          renderItem={taskRenderItem}
          data={activeDay?.tasks}
          estimatedItemSize={62}
        ></FlashList>
      </View>
    </Animated.View>
  );
}

export { ActiveDayTaskList };
