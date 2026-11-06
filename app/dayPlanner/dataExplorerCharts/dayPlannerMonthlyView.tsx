import { StyleSheet, View } from "react-native";
import { useDayPlannerChartDataState } from "./dayPlannerChartData";
import { useEffect } from "react";
import { getColorFromDayCompletion } from "@/components/utils/dataProcessing/getColorFromDayCompletion";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Text from "@/components/common/Text";

type DaySquareProps = {
  color: string;
  dayCompletion: number | null;
  textColor: string;
  day: string;
};

function DaySquare({ color, dayCompletion, day, textColor }: DaySquareProps) {
  const unavailable = dayCompletion === null;
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        unavailable ? `Day ${day}: no data` : `Day ${day}: ${dayCompletion}%`
      }
      style={styles.dayCell}
    >
      <View
        style={[
          styles.daySquare,
          {
            backgroundColor: unavailable
              ? globalStyle.colorInactive + "88"
              : color,
          },
        ]}
      >
        {unavailable && (
          <View
            style={{
              ...styles.unavailableLine,
              backgroundColor: globalStyle.colorInactive + "CC",
            }}
          />
        )}
        <Text
          fontSize={globalStyle.smallMobileFont}
          label={unavailable ? day : `${day}\n${dayCompletion}%`}
          color={unavailable ? globalStyle.foregroundContrastColor : textColor}
        ></Text>
      </View>
    </View>
  );
}

export default function DayPlannerMonthlyView() {
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
      accessibilityLabel={`${new Date(monthTimeRange.timeRangeStart).toLocaleString(undefined, { month: "long", year: "numeric" })} daily graph`}
      style={styles.monthGrid}
    >
      {monthViewData !== null &&
        monthViewData?.map((dayData, index) => {
          const dayCompletion = dayData?.completion;
          return (
            <DaySquare
              textColor={
                dayCompletion !== null
                  ? getColorFromDayCompletion(dayCompletion).alt
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
              dayCompletion={dayCompletion}
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
    transform: [{ rotate: "-45deg" }],
  },
});
