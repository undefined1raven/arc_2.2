import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
  VirtualizedList,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useTimeStatsData } from "@/stores/viewState/timeStatsData";
import { useCallback, useMemo, useState } from "react";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Animated, { FadeInDown } from "react-native-reanimated";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import Text from "@/components/common/Text";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { Dropdown } from "@/components/deco/Dropdown";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { ArcTaskLogType } from "@/constants/CommonTypes";
import { FlashList } from "@shopify/flash-list";
import { PieChartDeco } from "@/components/deco/PieChartDeco";
import { ListDeco } from "@/components/deco/ListDeco";
import { PieChart } from "react-native-gifted-charts";
import { getDisplayTimeFromMsDuration } from "@/components/utils/time/getDisplayTimeFromMsDuration";

function TimeTrackingDayView() {
  const timeTrackingDataApi = useTimeStatsData();
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const derivedData = timeTrackingDataApi.derivedActiveDayData;
  const screenDimensions = useWindowDimensions();
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (fc) => fc.timeTrackingFeatureConfig,
  );
  const [viewMode, setViewMode] = useState<"list" | "categoryBreakdown">(
    "list",
  );
  const displayLabel = useMemo(() => {
    const activeDay = timeTrackingDataApi.activeDayView;

    if (typeof activeDay !== "string") return "Select a day";
    const date = new Date(activeDay);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const dayOfWeek = date.toLocaleString("default", { weekday: "short" });
    return `${dayOfWeek} | ${day} ${month} ${year}`;
  }, [timeTrackingDataApi.activeDayView]);

  const getActivityDisplayInfoFromLog = useCallback(
    (log: ArcTaskLogType) => {
      const id = log.taskID;
      const activity = timeTrackingFeatureConfig.find(
        (item) => item.itme.taskID === id || item.itme.id === id,
      );

      let activityName = "Unknown Activity";
      let categoryName = "Unknown Category";

      if (activity) {
        activityName = activity.itme.name || "Unnamed Activity";
        const categoryId = activity.itme.categoryID;
        const category = timeTrackingFeatureConfig.find(
          (item) =>
            item.itme.categoryID === categoryId || item.itme.id === categoryId,
        );
        if (category) {
          categoryName = category.itme.name || "Unnamed Category";
        }
      }

      function formatTimeFromUnixTimestamp(timestamp: number | null) {
        if (timestamp === null) return "N/A";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      function formatDuration(duration: number | null) {
        if (duration === null) return "N/A";
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        if (hours === 0) {
          if (minutes === 0) {
            return `${seconds}s`;
          }
          return `${minutes}m ${seconds}s`;
        }

        return `${hours}h ${minutes}m`;
      }

      let duration = null;
      if (log.end) {
        duration = Math.floor((log.end - log.start) / 1000);
      }

      return {
        activityName,
        categoryName,
        startTime: formatTimeFromUnixTimestamp(log.start),
        endTime: formatTimeFromUnixTimestamp(log.end),
        duration: formatDuration(duration),
      };
    },
    [timeTrackingFeatureConfig],
  );

  const relevantItems = useMemo(() => {
    const dataInTimeRange = timeTrackingDataApi.dataInTimeRange;
    const activeDay = timeTrackingDataApi.activeDayView;
    if (!dataInTimeRange || typeof activeDay !== "string") return [];
    return dataInTimeRange
      .filter((item) => {
        const itemDate = new Date(item.start);
        return itemDate.toDateString() === new Date(activeDay).toDateString();
      })
      .reverse();
  }, [timeTrackingDataApi.dataInTimeRange, timeTrackingDataApi.activeDayView]);

  const renderItem = useCallback(
    ({ item }) => {
      const typedItem = item as ArcTaskLogType;
      const { activityName, categoryName, startTime, endTime, duration } =
        getActivityDisplayInfoFromLog(typedItem);

      return (
        <View
          style={{
            width: "100%",
            height: 50,
            zIndex: -1,
            display: "flex",
            borderRadius: globalStyle.borderRadius,
            justifyContent: "space-between",
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
            paddingLeft: 10,
            paddingRight: 10,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Text
              fontSize={globalStyle.regularMobileFont}
              label={activityName}
            ></Text>
            <Text
              fontSize={globalStyle.mediumMobileFont}
              label={categoryName}
            ></Text>
          </View>
          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Text
              fontSize={globalStyle.regularMobileFont}
              label={`${startTime} - ${endTime}`}
            ></Text>
            <Text
              fontSize={globalStyle.mediumMobileFont}
              label={duration}
            ></Text>
          </View>
        </View>
      );
    },
    [getActivityDisplayInfoFromLog],
  );

  const pieChartLegendRenderItem = useCallback(
    ({ item }) => {
      const typedItem = item as {
        value: number;
        label: string;
        color: string;
        duration: number;
      };

      return (
        <View
          style={{
            width: "100%",
            height: 50,
            zIndex: -1,
            display: "flex",
            borderRadius: globalStyle.borderRadius,
            justifyContent: "space-between",
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
            paddingLeft: 10,
            paddingRight: 10,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 10,
            }}
          >
            <View
              style={{
                height: 30,
                width: 30,
                borderRadius: 5,
                backgroundColor: typedItem.color,
              }}
            ></View>
            <Text
              fontSize={globalStyle.regularMobileFont}
              label={typedItem.label}
            ></Text>
          </View>
          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Text
              fontSize={globalStyle.mediumMobileFont}
              label={typedItem.value + "%"}
            ></Text>
            <Text
              fontSize={globalStyle.mediumMobileFont}
              label={getDisplayTimeFromMsDuration(typedItem.duration)}
            ></Text>
          </View>
        </View>
      );
    },
    [getActivityDisplayInfoFromLog],
  );

  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        {viewMode === "list" ? (
          <View style={{ flex: 1, width: "100%", marginBottom: 5 }}>
            <VirtualizedList
              getItemCount={() => relevantItems.length}
              getItem={(data, index) => data[index]}
              keyExtractor={(item) => item.start.toString()}
              inverted={true}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    zIndex: -1,
                    height: 10,
                  }}
                />
              )}
              data={relevantItems}
              renderItem={renderItem}
            ></VirtualizedList>
          </View>
        ) : (
          <View style={{ flex: 1, width: "100%", marginBottom: 5 }}>
            <View
              style={{
                height: screenDimensions.height / 2,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PieChart
                data={derivedData?.categoryBreakdown || []}
                donut
                sectionAutoFocus
                radius={screenDimensions.width / 2.5}
                innerRadius={(screenDimensions.width / 2.5) * 0.6}
                innerCircleColor={globalStyle.pageBackgroundColors[0]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FlashList
                estimatedItemSize={50}
                keyExtractor={(item) => item.label + item.value.toString()}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      zIndex: -1,
                      height: 10,
                    }}
                  />
                )}
                data={derivedData?.categoryBreakdown || []}
                renderItem={pieChartLegendRenderItem}
              ></FlashList>
            </View>
          </View>
        )}
        <Animated.View
          entering={FadeInDown}
          style={{
            height: 60,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: globalStyle.borderRadius,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        >
          <View style={{ flex: 1, display: "flex", flexDirection: "row" }}>
            <Button
              onClick={() => {
                router.back();
              }}
              style={{
                borderRadius: 0,
                borderWidth: 0,
                borderRightWidth: 1,
                bottom: 0,
                width: 80,
                height: 60,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Dropdown style={{ transform: [{ rotate: "90deg" }] }}></Dropdown>
            </Button>
            <Text textAlign="left" label={displayLabel}></Text>
          </View>
          <View>
            <Button
              onClick={() => {
                setViewMode((prev) =>
                  prev === "list" ? "categoryBreakdown" : "list",
                );
              }}
              style={{
                height: "100%",
                width: 70,
                borderWidth: 0,
                borderLeftWidth: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {viewMode === "list" ? (
                <PieChartDeco></PieChartDeco>
              ) : (
                <ListDeco width={30} height={40}></ListDeco>
              )}
            </Button>
          </View>
        </Animated.View>
      </ThemedView>
    </>
  );
}
export default TimeTrackingDayView;

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
