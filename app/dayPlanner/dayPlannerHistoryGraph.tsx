import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { Dropdown } from "@/components/deco/Dropdown";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import Animated, { FadeInDown } from "react-native-reanimated";
import { DayPlannerWeekView } from "./dataExplorerCharts/dayPlannerWeekView";
import { useDayPlannerChartDataState } from "./dataExplorerCharts/dayPlannerChartData";
import DayPlannerMonthlyView from "./dataExplorerCharts/dayPlannerMonthlyView";

function DayPlannerGraph() {
  const weekTimeRange = useDayPlannerChartDataState((s) => s.weekTimeRange);
  const monthTimeRange = useDayPlannerChartDataState((s) => s.monthTimeRange);
  const yearTimeRange = useDayPlannerChartDataState((s) => s.yearTimeRange);
  const globalDataStartTime = useDayPlannerChartDataState(
    (s) => s.globalDataTimeStart,
  );
  const monthViewData = useDayPlannerChartDataState((s) => s.monthViewData);
  const yearViewData = useDayPlannerChartDataState((s) => s.yearViewData);

  const [currentViewTimeRange, setCurrentViewTimeRange] = useState<{
    timeRangeStart: number;
    timeRangeEnd: number;
  }>(weekTimeRange);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const isLoadingData = useDayPlannerChartDataState((s) => s.isLoadingData);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const onDismiss = useCallback(() => {
    setIsDatePickerOpen(false);
  }, [setIsDatePickerOpen]);
  const [timeRangeMode, setTimeRangeMode] = useState<"7d" | "4w" | "1y">("7d");
  useEffect(() => {
    switch (timeRangeMode) {
      case "7d":
        setCurrentViewTimeRange(weekTimeRange);
        break;
      case "4w":
        setCurrentViewTimeRange(monthTimeRange);
        break;
      case "1y":
        setCurrentViewTimeRange(yearTimeRange);
        break;
      default:
        break;
    }
  }, [timeRangeMode, weekTimeRange, monthTimeRange, yearTimeRange]);

  useEffect(() => {
    const dayPlannerChartDataState = useDayPlannerChartDataState.getState();
    const weekState = dayPlannerChartDataState.weekViewData;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (weekState === null) {
      dayPlannerChartDataState.setWeekTimeRange({
        timeRangeStart: oneWeekAgo.getTime(),
        timeRangeEnd: Date.now(),
      });
    }
  }, []);

  const onNextTimeRangeClick = useCallback(
    (nextRangeType: "previous" | "next") => {
      if (isLoadingData) return;
      switch (timeRangeMode) {
        case "7d": {
          const dayPlannerChartDataState =
            useDayPlannerChartDataState.getState();

          const weekTimeRange = dayPlannerChartDataState.weekTimeRange;
          if (!weekTimeRange) return;

          const offset = nextRangeType === "next" ? 7 : -7;

          const newStart = new Date(weekTimeRange.timeRangeStart);
          newStart.setDate(newStart.getDate() + offset);

          const newEnd = new Date(weekTimeRange.timeRangeEnd);
          newEnd.setDate(newEnd.getDate() + offset);

          if (nextRangeType === "next") {
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            if (newStart.getTime() > today.getTime()) return;

            if (newEnd.getTime() > today.getTime()) {
              newEnd.setTime(today.getTime());
              newStart.setTime(today.getTime() - 6 * 24 * 60 * 60 * 1000);
            }
          }

          dayPlannerChartDataState.setWeekTimeRange({
            timeRangeStart: newStart.getTime(),
            timeRangeEnd: newEnd.getTime(),
          });

          break;
        }
        case "4w": {
          const dayPlannerChartDataState =
            useDayPlannerChartDataState.getState();

          const monthTimeRange = dayPlannerChartDataState.monthTimeRange;
          if (!monthTimeRange) return;

          const offset = nextRangeType === "next" ? 28 : -28;

          const newStart = new Date(monthTimeRange.timeRangeStart);
          newStart.setDate(newStart.getDate() + offset);

          const newEnd = new Date(monthTimeRange.timeRangeEnd);
          newEnd.setDate(newEnd.getDate() + offset);

          if (nextRangeType === "next") {
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            if (newStart.getTime() > today.getTime()) return;

            if (newEnd.getTime() > today.getTime()) {
              newEnd.setTime(today.getTime());
              newStart.setTime(today.getTime() - 27 * 24 * 60 * 60 * 1000);
            }
          }

          dayPlannerChartDataState.setMonthTimeRange({
            timeRangeStart: newStart.getTime(),
            timeRangeEnd: newEnd.getTime(),
          });

          break;
        }

        default:
          break;
      }
    },
    [timeRangeMode, isLoadingData],
  );

  const onConfirm = useCallback(
    ({ date }: { date: string }) => {
      switch (timeRangeMode) {
        case "7d": {
          const dayPlannerChartDataState =
            useDayPlannerChartDataState.getState();
          const newStart = new Date(date);
          const newEnd = new Date(newStart);
          newEnd.setDate(newEnd.getDate() + 6);
          dayPlannerChartDataState.setWeekTimeRange({
            timeRangeStart: newStart.getTime(),
            timeRangeEnd: newEnd.getTime(),
          });
          break;
        }
        case "4w": {
          const dayPlannerChartDataState =
            useDayPlannerChartDataState.getState();
          const newStart = new Date(date);
          const newEnd = new Date(newStart);
          newEnd.setDate(newEnd.getDate() + 27);
          dayPlannerChartDataState.setMonthTimeRange({
            timeRangeStart: newStart.getTime(),
            timeRangeEnd: newEnd.getTime(),
          });
          break;
        }
        default:
          break;
      }
      setIsDatePickerOpen(false);
    },
    [setIsDatePickerOpen, timeRangeMode],
  );

  const getDisplayLabelFromDay = useCallback((unix: number) => {
    const date = new Date(unix);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  return (
    <View
      style={{
        justifyContent: "flex-end",
        flex: 1,
        alignItems: "center",
        display: "flex",
        gap: 10,
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 5,
        borderColor: globalStyle.colorAccent,
      }}
    >
      {timeRangeMode === "7d" && <DayPlannerWeekView></DayPlannerWeekView>}
      {timeRangeMode === "4w" && (
        <DayPlannerMonthlyView
          month={new Date(new Date().setMonth(2))}
        ></DayPlannerMonthlyView>
      )}
      <Animated.View
        entering={FadeInDown.duration(100)}
        style={{
          height: 40,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          flexShrink: 0,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            height: "100%",
            width: 130,
            flexShrink: 0,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
            display: "flex",
            flexDirection: "row",
            borderRadius: globalStyle.borderRadius,
            justifyContent: "space-between",
            paddingRight: 10,
          }}
        >
          <Text
            fontSize={globalStyle.mediumMobileFont}
            label="Time period"
            textAlign="left"
          ></Text>
          {isLoadingData && (
            <ActivityIndicator
              color={globalStyle.color}
              size="small"
            ></ActivityIndicator>
          )}
        </View>
        <Button
          onClick={() => {
            onNextTimeRangeClick("previous");
          }}
          style={{
            flex: 1,
            height: 40,
            display: "flex",
            alignItems: "center",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            justifyContent: "center",
          }}
        >
          <View style={{ transform: [{ rotate: "90deg" }] }}>
            <Dropdown width={25} height={25}></Dropdown>
          </View>
        </Button>
        <Button
          onClick={() => {
            setIsDatePickerOpen(true);
          }}
          style={{
            flex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            flexDirection: "row",
          }}
        >
          <Text
            label={getDisplayLabelFromDay(currentViewTimeRange.timeRangeStart)}
            style={{ flex: 2, zIndex: -1, paddingLeft: 5, paddingRight: 5 }}
            fontSize={globalStyle.mediumMobileFont}
          ></Text>
          <View
            style={{
              flex: 1,
              backgroundColor: globalStyle.color,
              height: 1,
              zIndex: -1,
            }}
          ></View>
          <Text
            label={getDisplayLabelFromDay(currentViewTimeRange.timeRangeEnd)}
            style={{ flex: 2, zIndex: -1, paddingLeft: 5, paddingRight: 5 }}
            fontSize={globalStyle.mediumMobileFont}
          ></Text>
        </Button>
        <Button
          onClick={() => {
            onNextTimeRangeClick("next");
          }}
          disabled={(() => {
            const lastDate = new Date(currentViewTimeRange.timeRangeEnd);
            const today = new Date();

            return lastDate.getDate() === today.getDate();
          })()}
          style={{
            flex: 1,
            display: "flex",
            height: 40,
            alignItems: "center",
            borderTopWidth: 0,
            justifyContent: "center",
            borderBottomWidth: 0,
          }}
        >
          <View style={{ transform: [{ rotate: "-90deg" }] }}>
            <Dropdown width={25} height={25}></Dropdown>
          </View>
        </Button>
      </Animated.View>
      <Animated.View
        entering={FadeInDown.duration(100)}
        style={{
          height: 40,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          flexShrink: 0,
          flexDirection: "row",
        }}
      >
        <Text
          fontSize={globalStyle.mediumMobileFont}
          label="Data Range"
          textAlign="left"
          style={{
            height: "100%",
            width: 130,
            flexShrink: 0,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        ></Text>
        <Button
          onClick={() => {
            setTimeRangeMode("7d");
          }}
          style={{
            height: "100%",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            flex: 1,
          }}
          selected={timeRangeMode === "7d"}
          fontSize={globalStyle.mediumMobileFont}
          label="7d"
        ></Button>
        <Button
          onClick={() => {
            if (monthViewData === null) {
              const oneMonthAgo = new Date();
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              useDayPlannerChartDataState.getState().setMonthTimeRange({
                timeRangeStart: oneMonthAgo.getTime(),
                timeRangeEnd: Date.now(),
              });
            }
            setTimeRangeMode("4w");
          }}
          selected={timeRangeMode === "4w"}
          style={{
            height: "100%",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            flex: 1,
          }}
          fontSize={globalStyle.mediumMobileFont}
          label="4w"
        ></Button>
        <Button
          onClick={() => {
            if (yearViewData === null) {
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
              useDayPlannerChartDataState.getState().setYearTimeRange({
                timeRangeStart: oneYearAgo.getTime(),
                timeRangeEnd: Date.now(),
              });
            }
            setTimeRangeMode("1y");
          }}
          selected={timeRangeMode === "1y"}
          style={{
            height: "100%",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            flex: 1,
          }}
          fontSize={globalStyle.mediumMobileFont}
          label="1y"
        ></Button>
      </Animated.View>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={isDatePickerOpen}
        onDismiss={onDismiss}
        saveLabel="Save"
        label={`Pick ${timeRangeMode === "7d" ? "week" : timeRangeMode === "4w" ? "month" : "year"} start date`}
        startDate={new Date(currentViewTimeRange.timeRangeStart)}
        validRange={{
          startDate: new Date(globalDataStartTime ?? 0),
          endDate: new Date(),
        }}
        onConfirm={onConfirm}
      />
    </View>
  );
}

export default DayPlannerGraph;
