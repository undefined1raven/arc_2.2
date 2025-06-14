import Button from "@/components/common/Button";
import { Selection } from "@/components/common/Selection";
import Text from "@/components/common/Text";
import { EditDeco } from "@/components/deco/EditDeco";
import { HexDeco } from "@/components/deco/HexDeco";
import { StrikeThroughHex } from "@/components/deco/StrikeThroughHex";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import {
  HabitCardDataType,
  useHabitCardDataApi,
} from "@/stores/viewState/habitCardData";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActiveUser } from "@/stores/activeUser";

function HabitCard() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const timeTrackingFC = useFeatureConfigs((r) => r.timeTrackingFeatureConfig);
  const habitCardDataApi = useHabitCardDataApi();
  const habitCardTrackedIds = useHabitCardDataApi((r) => r.trackedIds);
  const activeUserId = useActiveUser((state) => state.activeUser.userId);
  const getDateFromTimestamp = (timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  };
  const formatDateToMonthDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} mins`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    AsyncStorage.getItem(`${activeUserId}-habitCardData`)
      .then((data) => {
        if (data === null) {
        } else {
          const parsedData: string[] = JSON.parse(data);
          const habitDataApi = useHabitCardDataApi.getState();
          habitDataApi.setTrackedIds(parsedData);
        }
      })
      .catch((error) => {});
  }, [activeUserId]);

  const getHabitData = useCallback((trackedIds: string[]) => {
    const dataRetrivalAPI = dataRetrivalApi.getState();
    const twoWeeksAgo = Date.now() - 120 * 24 * 60 * 60 * 1000;
    const twoWeeksAgoA = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const timeTrackingFeatureConfig =
      useFeatureConfigs.getState().timeTrackingFeatureConfig;

    const ids = trackedIds;

    dataRetrivalAPI
      .getDataInTimeRange("timeTrackingChunks", twoWeeksAgo, null, null)
      .then((data) => {
        const habitData: HabitCardDataType = [];

        const sortedData = data.payload
          .sort((a, b) => a.start - b.start)
          .filter((t) => t.start > twoWeeksAgoA)
          .filter((t) => ids.includes(t.taskID));

        ////GET INITIAL DATA
        for (let ix = 0; ix < sortedData.length; ix++) {
          const item = sortedData[ix];

          const task = timeTrackingFeatureConfig.find(
            (t) => t.itme.taskID === item.taskID
          );

          if (!task) {
            continue;
          }
          const activityName = task?.itme.name;

          const existingHabitIndex = habitData.findIndex(
            (h) => h.activityName === activityName
          );
          const existingHabit =
            existingHabitIndex !== -1 ? habitData[existingHabitIndex] : null;

          const activityDuration = Math.floor((item.end - item.start) / 1000);

          const activityDate = getDateFromTimestamp(item.start);

          if (existingHabit) {
            const streakData = [...existingHabit.streakData];
            const existingStreak = streakData.find(
              (s) => s.date === activityDate
            );
            if (existingStreak) {
              const newStreak = { ...existingStreak };
              const newDuration = existingStreak.duration + activityDuration;
              newStreak.duration = newDuration;

              const strekIndex = streakData.findIndex(
                (s) => s.date === activityDate
              );
              streakData[strekIndex] = newStreak;
            } else {
              streakData.push({
                date: activityDate,
                duration: activityDuration,
              });
            }

            habitData[existingHabitIndex] = {
              ...existingHabit,
              streakData: streakData,
            };
          } else {
            habitData.push({
              activityName: activityName,
              streakData: [
                {
                  date: activityDate,
                  duration: activityDuration,
                },
              ],
            });
          }
        }

        ////ADD EMPTY HABIT IF THERE AREN'T ANY ACTIVITIES WITH THOSE IDS IN THE SPECIFIED TIME RANGE
        for (let ix = 0; ix < ids.length; ix++) {
          const taskId = ids[ix];
          const task = timeTrackingFeatureConfig.find(
            (t) => t.itme.taskID === taskId
          );
          if (!task) {
            continue;
          }
          const activityName = task?.itme.name;
          const existingHabitIndex = habitData.findIndex(
            (h) => h.activityName === activityName
          );
          if (existingHabitIndex === -1) {
            habitData.push({
              activityName: activityName,
              streakData: [],
            });
          }
        }

        ////FILL BLANK DAYS
        for (let ix = 0; ix < habitData.length; ix++) {
          const habit = habitData[ix];
          const streakData = [...habit.streakData];
          const startDate = new Date(twoWeeksAgoA);
          const endDate = new Date();
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split("T")[0];
            const existingStreak = streakData.find(
              (s) => s.date === dateString
            );
            if (!existingStreak) {
              streakData.push({ date: dateString, duration: 0 });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          habitData[ix] = {
            ...habit,
            streakData: streakData.sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            ),
          };
        }

        habitCardDataApi.setDerivedData(habitData);
      })
      .catch((error) => {
        console.error("Error retrieving habit data:", error);
      });
  }, []);

  useEffect(() => {
    if (habitCardTrackedIds === null || habitCardTrackedIds.length === 0) {
      return;
    }
    if (habitCardDataApi.derivedData === null) {
      getHabitData(habitCardTrackedIds);
    }
  }, [habitCardDataApi.derivedData, habitCardTrackedIds]);

  return (
    <SafeAreaView
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: globalStyle.borderRadius,
        width: "100%",
        position: "relative",
        backgroundColor: globalStyle.color + layoutCardLikeBackgroundOpacity,
      }}
    >
      {habitCardDataApi.derivedData === null && (
        <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
      )}
      {habitCardDataApi.derivedData !== null && (
        <>
          <View
            style={{
              top: -50,
              height: 20,
              marginLeft: 5,
              marginRight: 5,
              marginTop: 5,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <Text label="Habits"></Text>
            <Selection
              onMultiSelection={(taskIds) => {
                const stringified = JSON.stringify(taskIds);
                const habitDataApi = useHabitCardDataApi.getState();
                habitDataApi.setTrackedIds(taskIds);
                getHabitData(taskIds);
                AsyncStorage.setItem(
                  `${activeUserId}-habitCardData`,
                  stringified
                ).catch((error) => {
                  console.error("Error saving habit card data:", error);
                });
              }}
              values={timeTrackingFC.filter((r) => r.type === "task")}
              labelKeys={["itme", "name"]}
              multiselectMatchKeys={["itme", "taskID"]}
              value={habitCardTrackedIds}
              multiselect={true}
              customSelectionButton={(props: { onClick: () => void }) => {
                return (
                  <Button
                    onClick={props.onClick}
                    style={{
                      height: 30,
                      width: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EditDeco></EditDeco>
                  </Button>
                );
              }}
            ></Selection>
          </View>
          <View
            style={{
              top: -30,
              width: "100%",
              display: "flex",
              flexGrow: 1,
            }}
          >
            <FlatList
              data={habitCardDataApi.derivedData}
              horizontal={true}
              extraData={habitCardTrackedIds}
              renderItem={({ item }) => (
                <View
                  style={{
                    userSelect: "none",
                    height: "100%",
                    zIndex: -1,
                    width: 180,
                    borderRightWidth: 1,
                    marginRight: 5,
                    borderRightColor: globalStyle.color,
                  }}
                >
                  <Text
                    style={{ width: "100%", position: "relative", left: -7 }}
                    textAlign="left"
                    label={item.activityName}
                  ></Text>
                  <FlatList
                    key={(itx) => itx.date}
                    renderItem={({ item }) => {
                      const hasDoneActivity = item.duration > 0;
                      return (
                        <View
                          style={{
                            width: "100%",
                            height: 35,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingBottom: 5,
                          }}
                        >
                          <View
                            style={{
                              marginLeft: 5,
                              marginRight: 5,
                              height: 20,
                              width: 20,
                            }}
                          >
                            {hasDoneActivity ? (
                              <HexDeco
                                width={20}
                                height={20}
                                color={globalStyle.successColor}
                              ></HexDeco>
                            ) : (
                              <StrikeThroughHex
                                width={20}
                                height={20}
                                color={globalStyle.color}
                              ></StrikeThroughHex>
                            )}
                          </View>
                          <Text
                            fontSize={globalStyle.mediumMobileFont}
                            label={`${formatDateToMonthDay(item.date)} ${
                              item.duration > 0
                                ? `| ${formatDuration(item.duration)}`
                                : ""
                            }`}
                          ></Text>
                        </View>
                      );
                    }}
                    data={item.streakData}
                  ></FlatList>
                </View>
              )}
              keyExtractor={(item) => item.activityName}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

export { HabitCard };
