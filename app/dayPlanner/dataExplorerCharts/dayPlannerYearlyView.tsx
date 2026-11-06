import { StyleSheet, View } from "react-native";
import { useDayPlannerChartDataState } from "./dayPlannerChartData";
import { getColorFromDayCompletion } from "@/components/utils/dataProcessing/getColorFromDayCompletion";
import { useGlobalStyleStore } from "@/stores/globalStyles";

export default function DayPlannerYearlyView() {
  const yearViewData = useDayPlannerChartDataState((s) => s.yearViewData);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const yearViewDataRange = useDayPlannerChartDataState((s) => s.yearTimeRange);
  return (
    <View
      accessible
      accessibilityLabel={`${new Date(yearViewDataRange.timeRangeStart).toDateString()} daily completion graph`}
      style={styles.yearGrid}
    >
      {yearViewData?.map((dayData) => {
        const completion = dayData.completion;
        const unavailable = completion === null;

        return (
          <View
            key={dayData.day}
            accessible
            accessibilityRole="image"
            accessibilityLabel={
              unavailable
                ? `${dayData.day}: no data`
                : `${dayData.day}: ${completion}%`
            }
            style={[
              styles.daySquare,
              {
                backgroundColor: unavailable
                  ? globalStyle.colorInactive + "55"
                  : getColorFromDayCompletion(completion).color,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  yearGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 3,
  },
  daySquare: {
    width: "2.1%",
    aspectRatio: 1,
    borderRadius: 2,
  },
});
