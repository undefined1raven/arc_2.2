import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import {
  TessDayLogType,
  TessStatusType,
  TessTaskType,
} from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from "react-native";
import { DayPlannerCard } from "../dayPlanner/DayPlannerCard";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { layoutAnimationsDuration } from "@/constants/animations";
import { FlashList } from "@shopify/flash-list";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import {
  ANDROID_RIPPLE_TRANSPARENCY,
  layoutCardLikeBackgroundOpacity,
} from "@/constants/colors";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import TextInput from "@/components/common/TextInput";
import { SearchIcon } from "@/components/deco/SearchIcon";
import { AddIcon } from "@/components/deco/AddIcon";
import { router } from "expo-router";
import { v4 } from "uuid";
import { debounce } from "lodash";
import { useFeatureConfigs } from "@/stores/featureConfigs";
function dayPlannerActiveDayView() {
  const dataRetriavalAPI = dataRetrivalApi();
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (store) => store.activeDay
  );
  const featureConfigApi = useFeatureConfigs();
  const globalStyle = useGlobalStyleStore();
  const virtualKeyboardApi = useVirtualKeyboard();
  const [endDayLabel, setEndDayLabel] = useState<string>("End Day");
  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const [statusPickingForTask, setStatusPickingForTask] =
    useState<TessTaskType | null>(null);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  const getStatusNameForTask = useCallback(
    (task: TessTaskType) => {
      const statusId = task.statusID;
      const status = featureConfigApi.dayPlannerFeatureConfig.find(
        (status: TessStatusType) => status.statusID === statusId
      );
      if (status) {
        return status.name;
      } else {
        return "Unknown Status";
      }
    },
    [featureConfigApi.dayPlannerFeatureConfig]
  );

  const debouncedUpdateTaskName = useCallback(
    debounce((task: TessTaskType, newName: string) => {
      if (!task || !dayPlannerActiveDay) return;

      const updatedTask: TessTaskType = {
        ...task,
        name: newName,
      };

      const updatedTasks = dayPlannerActiveDay?.tasks.map((t) =>
        t.TTID === task.TTID ? updatedTask : t
      );

      if (!updatedTasks) {
        return;
      }
      const updatedDay = {
        ...dayPlannerActiveDay,
        tasks: updatedTasks,
      };

      useDayPlannerActiveDay.getState().setActiveDay(updatedDay);

      dataRetriavalAPI
        .modifyEntry(
          "dayPlannerChunks",
          ["day"],
          updatedDay.day,
          updatedDay,
          undefined,
          "replace"
        )
        .then((r) => {
          console.log("Task name updated", r);
        })
        .catch((e) => {
          console.error("Error updating task name", e);
        });
    }, 500),
    [dayPlannerActiveDay]
  );

  const getStatusColorsForTask = useCallback(
    (task: TessTaskType) => {
      function returnDefaultColors() {
        return {
          color: globalStyle.globalStyle.color,
          textColor: globalStyle.globalStyle.textColor,
        };
      }

      const statusId = task.statusID;
      const status = featureConfigApi.dayPlannerFeatureConfig.find(
        (status: TessStatusType) => status.statusID === statusId
      );
      if (status) {
        const statusColors = status.colors;
        if (statusColors === "default") {
          return returnDefaultColors();
        } else {
          const schemeColors =
            statusColors[globalStyle.globalStyle.colorScheme];
          if (!schemeColors) {
            return returnDefaultColors();
          }
          const themeColors = schemeColors[globalStyle.globalStyle.theme];
          if (!themeColors) {
            return returnDefaultColors();
          }
          return {
            color: themeColors.color,
            textColor: themeColors.textColor,
          };
        }
      } else {
        return returnDefaultColors();
      }
    },
    [featureConfigApi.dayPlannerFeatureConfig]
  );

  const updateTaskStatus = useCallback(
    (statusID: string) => {
      if (
        dayPlannerActiveDay === undefined ||
        dayPlannerActiveDay === null ||
        typeof statusID !== "string" ||
        typeof statusPickingForTask?.TTID !== "string"
      ) {
        return;
      }
      const taskIndex = dayPlannerActiveDay.tasks.findIndex(
        (task) => task.TTID === statusPickingForTask?.TTID
      );
      if (taskIndex === -1) {
        return;
      }
      const updatedTask: TessTaskType = {
        ...dayPlannerActiveDay.tasks[taskIndex],
        statusID: statusID,
      };
      const updatedTasks = [...dayPlannerActiveDay.tasks];
      updatedTasks[taskIndex] = updatedTask;
      const updatedDay = {
        ...dayPlannerActiveDay,
        tasks: updatedTasks,
      };
      useDayPlannerActiveDay.getState().setActiveDay(updatedDay);
      setStatusPickingForTask(null);
      dataRetriavalAPI
        .modifyEntry(
          "dayPlannerChunks",
          ["day"],
          updatedDay.day,
          updatedDay,
          undefined,
          "replace"
        )
        .then((r) => {
          console.log("Task status updated", r);
        })
        .catch((e) => {
          console.error("Error updating task status", e);
        });
    },
    [statusPickingForTask]
  );

  const endDay = useCallback(() => {
    if (dayPlannerActiveDay === undefined || dayPlannerActiveDay === null) {
      return;
    }
    const endedDay: TessDayLogType = { ...dayPlannerActiveDay };
    delete endedDay.isActive;
    dataRetriavalAPI
      .modifyEntry(
        "dayPlannerChunks",
        ["day"],
        endedDay.day,
        endedDay,
        undefined,
        "replace"
      )
      .then((r) => {
        useDayPlannerActiveDay.getState().setActiveDay(null);
        console.log("Day ended", r);
        router.replace("/dayPlanner/dayPlanner");
      })
      .catch((e) => {
        router.replace("/dayPlanner/dayPlanner");
        console.error("Error ending day", e);
      });
  }, [dayPlannerActiveDay]);

  const addTaskToDay = useCallback(() => {
    if (
      dayPlannerActiveDay === undefined ||
      dayPlannerActiveDay === null ||
      typeof dayPlannerActiveDay.tasks.length !== "number"
    ) {
      return;
    }
    let defaultStatusId: string = featureConfigApi.dayPlannerFeatureConfig.find(
      (status: TessStatusType) => status.name === "To Do"
    )?.statusID;
    if (!defaultStatusId) {
      defaultStatusId = featureConfigApi.dayPlannerFeatureConfig[0].statusID;
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
    const allTasks = [...dayPlannerActiveDay.tasks, newTask];
    const newDay: TessDayLogType = {
      ...dayPlannerActiveDay,
      tasks: allTasks,
    };
    useDayPlannerActiveDay.getState().setActiveDay(newDay);
    dataRetriavalAPI
      .modifyEntry(
        "dayPlannerChunks",
        ["day"],
        newDay.day,
        newDay,
        undefined,
        "replace"
      )
      .then((r) => {
        console.log("Day updated", r);
      })
      .catch((e) => {
        console.error("Error updating day", e);
      });
  }, [dayPlannerActiveDay, featureConfigApi.dayPlannerFeatureConfig]);

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      <Animated.View
        style={{
          width: "100%",
          borderRadius: globalStyle.globalStyle.borderRadius,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          bottom: virtualKeyboardApi.isVisible
            ? virtualKeyboardApi.keyboardHeight
            : 0,
        }}
      >
        {virtualKeyboardApi.isVisible && (
          <Animated.View
            style={{
              height: virtualKeyboardApi.keyboardHeight,
              width: "100%",
            }}
          ></Animated.View>
        )}
        <Animated.View
          entering={customFadeInUp(layoutAnimationsDuration)}
          style={{
            position: "relative",
            width: "100%",
            top: "0%",
            flexGrow: 1,
          }}
        >
          <FlashList
            inverted={true}
            data={
              statusPickingForTask === null
                ? dayPlannerActiveDay?.tasks
                : featureConfigApi.dayPlannerFeatureConfig.filter(
                    (r: TessStatusType) => r.deleted !== true
                  )
            }
            estimatedItemSize={55}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    transform: [{ rotate: "180deg" }],
                    width: "100%",
                    height: 50,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                  }}
                >
                  <Button
                    label="Add Task"
                    textStyle={{ textAlign: "left", paddingLeft: 10 }}
                    onClick={addTaskToDay}
                    style={{
                      width: "80%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <AddIcon
                      style={{ position: "absolute", right: 10 }}
                      width={23}
                      height={23}
                    ></AddIcon>
                  </Button>
                </View>
              );
            }}
            renderItem={({ item }) => {
              if (statusPickingForTask !== null) {
                const typedItem = item as TessStatusType;
                return (
                  <Button
                    textStyle={{ textAlign: "left", paddingLeft: 10 }}
                    onClick={() => {
                      updateTaskStatus(typedItem.statusID);
                    }}
                    style={{
                      height: 55,
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    label={typedItem.name}
                  ></Button>
                );
              } else {
                const typedItem = item as TessDayLogType["tasks"][number];
                return (
                  <View
                    style={{
                      height: 55,
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "space-between",
                      borderWidth: 1,
                      borderRadius: globalStyle.globalStyle.borderRadius,
                      borderColor: getStatusColorsForTask(typedItem).color,
                    }}
                  >
                    <TextInput
                      defaultValue={typedItem.name}
                      onChange={(e) => {
                        const newName = e.nativeEvent.text;
                        debouncedUpdateTaskName(typedItem, newName);
                      }}
                      textAlign="left"
                      color={getStatusColorsForTask(typedItem).textColor}
                      style={{
                        position: "absolute",
                        left: 0,
                        flexGrow: 1,
                        height: "100%",
                        backgroundColor: "#00000000",
                        borderWidth: 0,
                        width: "64%",
                      }}
                    ></TextInput>
                    <Button
                      style={{
                        width: "35%",
                        position: "absolute",
                        right: 10,
                        height: "100%",
                        borderWidth: 0,
                      }}
                      androidRippleColor={null}
                      onClick={() => {
                        setStatusPickingForTask(typedItem as TessTaskType);
                      }}
                    ></Button>
                    <Text
                      style={{
                        width: "35%",
                        position: "absolute",
                        right: 10,
                        height: "50%",
                        paddingBottom: 3,
                        paddingTop: 3,
                        zIndex: -1,
                      }}
                      color={getStatusColorsForTask(typedItem).textColor}
                      label={getStatusNameForTask(typedItem)}
                      backgroundColor={
                        getStatusColorsForTask(typedItem).color + 35
                      }
                      fontSize={15}
                    ></Text>
                  </View>
                );
              }
            }}
          />
        </Animated.View>
        <Animated.View
          entering={customFadeInDown(layoutAnimationsDuration)}
          style={{
            marginTop: 5,
            height: 60,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              flexDirection: "row",
              borderRadius: globalStyle.globalStyle.borderRadius,
            }}
          >
            {statusPickingForTask === null ? (
              <>
                <Button
                  onClick={() => {
                    router.back();
                  }}
                  style={{
                    height: "80%",
                    width: "20%",
                    borderWidth: 0,
                    borderRightWidth: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ArrowDeco
                    width={40}
                    height={40}
                    style={{ transform: [{ rotate: "180deg" }] }}
                  ></ArrowDeco>
                </Button>
                <Button
                  androidRippleColor={
                    globalStyle.globalStyle.errorColor +
                    ANDROID_RIPPLE_TRANSPARENCY
                  }
                  style={{
                    flexGrow: 1,
                    height: "80%",
                    marginLeft: 15,
                    marginRight: 15,
                  }}
                  onClick={() => {
                    if (endDayLabel === "End Day") {
                      setEndDayLabel("Tap again to confirm");
                      setTimeout(() => {
                        setEndDayLabel("End Day");
                      }, 1500);
                    } else {
                      endDay();
                    }
                  }}
                  borderColor={globalStyle.globalStyle.errorColor}
                  color={globalStyle.globalStyle.errorTextColor}
                  label={endDayLabel}
                ></Button>
                <Button
                  style={{
                    height: "80%",
                    width: "20%",
                    borderWidth: 0,
                    borderLeftWidth: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  label=""
                  onClick={addTaskToDay}
                >
                  <AddIcon width={23} height={23}></AddIcon>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setStatusPickingForTask(null);
                  }}
                  style={{
                    height: "80%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  label="Cancel"
                ></Button>
              </>
            )}
          </View>
        </Animated.View>
        {virtualKeyboardApi.isVisible && (
          <Animated.View style={{ height: 25, width: "100%" }}></Animated.View>
        )}
      </Animated.View>
    </ThemedView>
  );
}
export default dayPlannerActiveDayView;
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
