import Text from "@/components/common/Text";
import { featureConfigChunkSize } from "@/components/utils/constants/chunking";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { DayBar } from "./dayBar";

function WeekOverview() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const dayPlannerData = useDayPlannerActiveDay((store) => store.recentDays);
  const hasLoadedInitialData = useDayPlannerActiveDay(
    (store) => store.hasLoadedInitialData,
  );
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (state) => state.dayPlannerFeatureConfig,
  );

  const last7DaysLabels = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 7; i >= 1; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      days.push(day.toLocaleDateString("en-US", { weekday: "short" }));
    }
    return days;
  }, []);

  const weekData = useMemo(() => {
    const days = dayPlannerData;
    const weekdayData: (number | null)[] = [];
    for (let i = 7; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toString().split(" ").slice(0, 4).join(" ");

      const dayData = days.find((day) => dateString === day.day);

      if (dayData !== undefined) {
        const dayCompletion = computeDayPlannerCompletion(
          dayPlannerFeatureConfig,
          dayData,
        );
        weekdayData.push(dayCompletion);
      } else {
        weekdayData.push(null);
      }
    }
    return weekdayData;
  }, [dayPlannerData, dayPlannerFeatureConfig]);

  return (
    <View
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
        borderTopColor: globalStyle.color + "80",
        borderTopWidth: 1,
      }}
    >
      <View
        style={{
          height: "23%",
          maxHeight: 35,
          width: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          paddingLeft: 5,
          paddingRight: 5,
        }}
      >
        <Text
          fontSize={12}
          style={{ maxWidth: "58%", textAlign: "left" }}
          label="Week Overview"
        ></Text>
      </View>

      {hasLoadedInitialData === true ? (
        <View style={{ width: "100%", flex: 1, padding: 5 }}>
          <View
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((day, ix) => (
              <DayBar
                dayIndex={ix}
                dayCompletionData={weekData[ix]}
                dayLabel={last7DaysLabels[ix]}
                key={day}
              />
            ))}
          </View>
        </View>
      ) : (
        <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
      )}
    </View>
  );
}

export { WeekOverview };
