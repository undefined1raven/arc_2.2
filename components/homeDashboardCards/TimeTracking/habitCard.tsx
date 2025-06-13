import Text from "@/components/common/Text";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import {
  HabitCardDataType,
  useHabitCardDataApi,
} from "@/stores/viewState/habitCardData";
import { FlashList } from "@shopify/flash-list";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function HabitCard() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);

  const habitCardDataApi = useHabitCardDataApi();

  const getDateFromTimestamp = (timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (habitCardDataApi.derivedData === null) {
      const dataRetrivalAPI = dataRetrivalApi.getState();
      const twoWeeksAgo = Date.now() - 120 * 24 * 60 * 60 * 1000;
      const twoWeeksAgoA = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const timeTrackingFeatureConfig =
        useFeatureConfigs.getState().timeTrackingFeatureConfig;

      const runningId = timeTrackingFeatureConfig.find(
        (r) => r.itme.name === "Running"
      ).itme.taskID;
      const runningId2 = timeTrackingFeatureConfig.find(
        (r) => r.itme.name === "Walk"
      ).itme.taskID;
      const runningId3 = timeTrackingFeatureConfig.find(
        (r) => r.itme.name === "Shower"
      ).itme.taskID;

      const ids = [runningId, runningId2, runningId3];

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
    }
  }, [habitCardDataApi.derivedData]);

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
              height: 100,
              width: "100%",
              display: "flex",
              flexShrink: 0,
              backgroundColor: "red",
            }}
          ></View>
          <View
            style={{
              top: -20,
              width: "100%",
              display: "flex",
              flexGrow: 1,
            }}
          >
            <FlatList
              data={habitCardDataApi.derivedData}
              horizontal={true}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 10,
                    height: "100%",
                    width: 180,
                    borderRightWidth: 1,
                    marginRight: 10,
                    borderRightColor: globalStyle.color,
                  }}
                >
                  <Text label={item.activityName}></Text>
                  <FlatList
                    key={(itx) => itx.date}
                    renderItem={({ item }) => {
                      const hasDoneActivity = item.duration > 0;
                      return (
                        <ActivityIndicator
                          color={
                            hasDoneActivity
                              ? globalStyle.successColor
                              : globalStyle.errorColor
                          }
                        ></ActivityIndicator>
                      );
                    }}
                    data={item.streakData.reverse()}
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
