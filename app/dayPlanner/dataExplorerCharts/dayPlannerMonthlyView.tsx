import { StyleSheet, View } from "react-native";
import { useDayPlannerChartDataState } from "./dayPlannerChartData";
import { useEffect } from "react";
import { getColorFromDayCompletion } from "@/components/utils/dataProcessing/getColorFromDayCompletion";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Text from "@/components/common/Text";

type DaySquareProps = {
  color: string;
  value: string | null;
  textColor: string;
  day: string;
};

type DayPlannerMonthlyViewProps = {
  month: Date;
};

function DaySquare({ color, value, day, textColor }: DaySquareProps) {
  const unavailable = value === null;
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        unavailable ? `Day ${day}: no data` : `Day ${day}: ${value}%`
      }
      style={styles.dayCell}
    >
      <View
        style={[
          styles.daySquare,
          { backgroundColor: unavailable ? globalStyle.colorInactive : color },
        ]}
      >
        {unavailable && <View style={styles.unavailableLine} />}
        <Text color={unavailable ? globalStyle.colorInactive : textColor}>
          {unavailable ? day : `${day}\n${value}`}
        </Text>
      </View>
    </View>
  );
}

/** A compact, seven-column monthly graph. Mock values are used until real data is wired in. */
export default function DayPlannerMonthlyView({
  month,
}: DayPlannerMonthlyViewProps) {
  const { monthTimeRange, monthViewData } = useDayPlannerChartDataState(
    (s) => s,
  );
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  useEffect(() => {
    if (monthViewData === null) {
      return;
    }
  }, [monthTimeRange]);

  return (
    <View
      accessible
      accessibilityLabel={`${month.toLocaleString(undefined, { month: "long", year: "numeric" })} daily graph`}
      style={styles.monthGrid}
    >
      {monthViewData !== null &&
        monthViewData?.map((dayData, index) => {
          const dayCompletion = dayData?.completion;
          return (
            <DaySquare
              textColor={
                dayCompletion !== null
                  ? getColorFromDayCompletion(dayCompletion).color
                  : globalStyle.colorInactive
              }
              key={dayData.day}
              day={
                dayData?.day?.split(" ")[2] + " " + dayData?.day?.split(" ")[1]
              }
              color={
                dayCompletion !== null
                  ? getColorFromDayCompletion(dayCompletion).color
                  : globalStyle.colorInactive
              }
              value={dayCompletion ? dayCompletion + "%" : null}
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  monthGrid: {
    width: "100%",
    flexDirection: "row",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dayCell: {
    width: "14.2857%",
    aspectRatio: 1,
    padding: 3,
  },
  emptyCell: {
    width: "14.2857%",
    aspectRatio: 1,
  },
  daySquare: {
    flex: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dayText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  unavailableText: {
    color: "#6b7280",
  },
  unavailableLine: {
    position: "absolute",
    width: "140%",
    height: 1,
    backgroundColor: "#9ca3af",
    transform: [{ rotate: "-45deg" }],
  },
});
