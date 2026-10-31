import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTimeStatsData } from "@/stores/viewState/timeStatsData";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { FlashList } from "@shopify/flash-list";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { router } from "expo-router";
import { BarChartDeco } from "@/components/deco/BarChartDeco";
import {
  processDataInTimeRange,
  useTimeTrackingDataExplorer,
} from "@/stores/viewState/timeTrackingDataExplorer";
import { DatePickerModal } from "react-native-paper-dates";
import { getLocalCache } from "@/components/utils/localDb";
function Home() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isLoadingInitialData, setIsLoadingInitialData] =
    useState<boolean>(false);
  const viewData = useTimeStatsData((s) => s.viewRange);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const setActiveDayView = useTimeStatsData((s) => s.setActiveDayView);
  const isFetchingData = useTimeStatsData((s) => s.isFetchingData);
  const globalTimeRangeStart = useTimeStatsData((s) => s.globalTimeRageStart);

  const getDataInTimeRange = useCallback(
    async (timeRangeStart: number, timeRangeEnd: number) => {
      setIsLoadingData(true);
      const timeStatsApi = useTimeStatsData.getState();
      const timeExplorerApi = useTimeTrackingDataExplorer.getState();
      const dataRetrivalAPI = dataRetrivalApi.getState();
      const data = await dataRetrivalAPI.getDataInTimeRange(
        "timeTrackingChunks",
        timeRangeStart,
        timeRangeEnd,
        null,
      );
      setIsLoadingData(false);
      setIsLoadingInitialData(false);
      if (data.status !== "success" || !data.payload) {
        console.error("Failed to fetch time tracking data");
        return;
      }
      timeExplorerApi.setDataInTimeRange(data.payload);
      timeStatsApi.setDataInTimeRange(data.payload);
      const currentSelectedActivities = timeExplorerApi.selectedActivities;
      const newViewState = processDataInTimeRange(
        data.payload,
        currentSelectedActivities,
      );
      timeExplorerApi.setViewState(newViewState);
    },
    [],
  );

  const defaultStartTime = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  useEffect(() => {
    const timeStatsApi = useTimeStatsData.getState();
    if (timeStatsApi.globalTimeRageStart === null) {
      getLocalCache().then(async (db) => {
        const firstChunk: null | { timeRangeStart: number } =
          await db.getFirstAsync(`SELECT timeRangeStart
          FROM timeTrackingChunks
          ORDER BY timeRangeStart ASC
      LIMIT 1;`);

        const globalTimeRangeStart = firstChunk?.timeRangeStart;
        if (typeof globalTimeRangeStart === "number") {
          const timeStatsApi = useTimeStatsData.getState();
          timeStatsApi.setGlobalTimeRangeStart(globalTimeRangeStart);
        }
      });
    }

    if (timeStatsApi.dataInTimeRange === null) {
      setIsLoadingInitialData(true);
      getDataInTimeRange(defaultStartTime.getTime(), Date.now());
    }
  }, []);

  const getListDisplayDateLabel = useCallback((dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const displayDate = date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    return `${dayOfWeek} ${displayDate}`;
  }, []);

  const getDisplayText = useMemo(() => {
    return (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const displayDate = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });
      return displayDate;
    };
  }, []);

  const onConfirmTimeRange = useCallback(
    ({
      startDate,
      endDate,
    }: {
      startDate: undefined | string;
      endDate: undefined | string;
    }) => {
      const now = new Date();
      const defaultEnd = now.getTime();
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 14);

      const parsedStart = startDate ? new Date(startDate).getTime() : NaN;
      const parsedEnd = endDate ? new Date(endDate).getTime() : NaN;

      const isValidRange =
        Number.isFinite(parsedStart) &&
        Number.isFinite(parsedEnd) &&
        parsedStart <= parsedEnd;

      const timeRangeStart = isValidRange
        ? parsedStart
        : defaultStart.getTime();

      const timeRangeEnd = isValidRange ? parsedEnd : defaultEnd;

      getDataInTimeRange(timeRangeStart, timeRangeEnd);
      setIsDatePickerOpen(false);
    },
    [],
  );

  const onDismiss = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const renderItem = useCallback(({ item }) => {
    const typedItem = item as string;

    return (
      <Button
        style={{
          width: "100%",
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "row",
          paddingLeft: 10,
          borderColor: globalStyle.color + "80",
          paddingRight: 10,
          gap: 5,
        }}
        onClick={() => {
          setActiveDayView(typedItem);
          router.push("/timeTrackingStats/statsDayView/timeTrackingDayView");
        }}
        label=""
      >
        <View
          style={{
            height: 1,
            width: 30,
            backgroundColor: globalStyle.color,
            borderRadius: globalStyle.borderRadius,
          }}
        ></View>
        <Text
          style={{ width: 90 }}
          fontSize={globalStyle.regularMobileFont}
          label={getListDisplayDateLabel(typedItem)}
        />
        <View
          style={{
            height: 1,
            flex: 1,
            backgroundColor: globalStyle.color,
            borderRadius: globalStyle.borderRadius,
          }}
        ></View>
      </Button>
    );
  }, []);

  return (
    <>
      <ThemedView
        style={{
          ...styles.container,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <View style={{ flex: 1, width: "100%", marginBottom: 5 }}>
          <FlashList
            estimatedItemSize={50}
            inverted={true}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  zIndex: -1,
                  height: 10,
                }}
              />
            )}
            data={viewData}
            renderItem={renderItem}
          ></FlashList>
        </View>
        <Animated.View
          entering={FadeInUp}
          style={{
            height: 50,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: "row",
            gap: 15,
          }}
        >
          <Text
            label="Time Tracking Explorer"
            textAlign="left"
            fontSize={globalStyle.mediumMobileFont}
            style={{
              flexGrow: 1,
              height: "100%",
              borderRadius: globalStyle.borderRadius,
              backgroundColor:
                globalStyle.color + layoutCardLikeBackgroundOpacity,
            }}
          >
            {isFetchingData && (
              <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
            )}
          </Text>

          <Button
            fontSize={globalStyle.regularMobileFont}
            style={{
              height: "100%",
              display: "flex",
              minWidth: 50,
              alignItems: "center",
              justifyContent: "center",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            }}
            onClick={() => {
              router.push(
                "/timeTrackingStats/dataExplorer/timeTrackingDataExplorer",
              );
            }}
          >
            <BarChartDeco
              style={{ zIndex: -1 }}
              height={28}
              width={35}
            ></BarChartDeco>
          </Button>
          <Button
            fontSize={globalStyle.regularMobileFont}
            style={{
              width: 150,
              height: "100%",
              borderTopWidth: 0,
              borderBottomWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 5,
            }}
            onClick={() => {
              if (isLoadingData === false) {
                setIsDatePickerOpen(true);
              }
            }}
          >
            {(isLoadingData || isLoadingInitialData) && (
              <ActivityIndicator
                color={globalStyle.color}
                size={"small"}
              ></ActivityIndicator>
            )}
            {isLoadingInitialData === false && (
              <Text
                style={{ zIndex: -1 }}
                fontSize={globalStyle.regularMobileFont}
                label={`${getDisplayText(
                  viewData[viewData.length - 1],
                )} - ${getDisplayText(viewData[0])}`}
              ></Text>
            )}
          </Button>
          <DatePickerModal
            locale="en"
            mode="range"
            visible={isDatePickerOpen}
            onDismiss={onDismiss}
            saveLabel="Save"
            label="Pick data range"
            startDate={new Date(viewData[0])}
            validRange={{
              startDate:
                globalTimeRangeStart === null
                  ? undefined
                  : new Date(globalTimeRangeStart),
              endDate: new Date(),
            }}
            endDate={new Date(viewData[viewData.length - 1])}
            onConfirm={onConfirmTimeRange}
          />
        </Animated.View>
      </ThemedView>
    </>
  );
}
export default Home;

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
