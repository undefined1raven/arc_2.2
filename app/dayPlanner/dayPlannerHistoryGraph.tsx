import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { Dropdown } from "@/components/deco/Dropdown";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import Animated, { FadeInDown } from "react-native-reanimated";
import { DayPlannerWeekView } from "./dataExplorerCharts/dayPlannerWeekView";
import { useDayPlannerChartDataState } from "./dataExplorerCharts/dayPlannerChartData";

function DayPlannerGraph() {
  const timeRange = useDayPlannerActiveDay((state) => state.dataTimeRange);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const onDismiss = useCallback(() => {
    setIsDatePickerOpen(false);
  }, [setIsDatePickerOpen]);
  const [timeRangeMode, setTimeRangeMode] = useState<"7d" | "4w" | "1y">("7d");

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

  const onConfirm = useCallback(
    ({ date }: { date: string }) => {
      const dayPlannerApi = useDayPlannerActiveDay.getState();
      // if (startDate === undefined || endDate === undefined) return;
      // const start = new Date(startDate).getTime();
      // const end = new Date(endDate).getTime();
      // dayPlannerApi.setDataTimeRange([start, end]);
      setIsDatePickerOpen(false);
    },
    [setIsDatePickerOpen],
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
        justifyContent: "center",
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
          label="Time period"
          textAlign="left"
          style={{
            height: "100%",
            width: 120,
            flexShrink: 0,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        ></Text>
        <Button
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
            label={getDisplayLabelFromDay(timeRange[0])}
            style={{ flex: 2, zIndex: -1 }}
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
            label={getDisplayLabelFromDay(timeRange[1])}
            style={{ flex: 2, zIndex: -1 }}
            fontSize={globalStyle.mediumMobileFont}
          ></Text>
        </Button>
        <Button
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
            width: 120,
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
        onChange={(r) => {
          console.log(r);
        }}
        visible={isDatePickerOpen}
        onDismiss={onDismiss}
        saveLabel="Save"
        label="Pick data range"
        startDate={new Date(2026, 8, 21)}
        validRange={{ startDate: new Date(2026, 6, 28), endDate: new Date() }}
        endDate={new Date()}
        onConfirm={onConfirm}
      />
    </View>
  );
}

export default DayPlannerGraph;
