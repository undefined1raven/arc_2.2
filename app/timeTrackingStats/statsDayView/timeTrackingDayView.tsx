import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useTimeStatsData } from "@/stores/viewState/timeStatsData";
import { useCallback, useMemo } from "react";
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

function TimeTrackingDayView() {
  const timeTrackingDataApi = useTimeStatsData();
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const timeTrackingFeatureConfig = useFeatureConfigs(
    (fc) => fc.timeTrackingFeatureConfig
  );

  const displayLabel = useMemo(() => {
    const activeDay = timeTrackingDataApi.activeDayView;

    if (typeof activeDay !== "string") return "Select a day";
    const date = new Date(activeDay);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, [timeTrackingDataApi.activeDayView]);

  const getActivityDisplayInfoFromLog = useCallback(
    (log: ArcTaskLogType) => {
      const id = log.taskID;
      const activity = timeTrackingFeatureConfig.find(
        (item) => item.itme.taskID === id || item.itme.id === id
      );

      let activityName = "Unknown Activity";
      let categoryName = "Unknown Category";

      if (activity) {
        activityName = activity.itme.name || "Unnamed Activity";
        const categoryId = activity.itme.categoryID;
        const category = timeTrackingFeatureConfig.find(
          (item) =>
            item.itme.categoryID === categoryId || item.itme.id === categoryId
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
    [timeTrackingFeatureConfig]
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
    [getActivityDisplayInfoFromLog]
  );

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <View style={{ flex: 1, width: "100%", marginBottom: 5 }}>
          <FlashList
            keyExtractor={(item) => item.start.toString()}
            estimatedItemSize={50}
            inverted={true}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 10,
                }}
              />
            )}
            data={relevantItems}
            renderItem={renderItem}
          ></FlashList>
        </View>
        <Animated.View
          entering={FadeInDown}
          style={{
            height: 60,
            width: "100%",
            borderRadius: globalStyle.borderRadius,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        >
          <Text
            textAlign="left"
            label={displayLabel}
            style={{
              flexShrink: 0,
              width: "100%",
              height: 65,
              paddingLeft: 90,
              backgroundColor:
                globalStyle.color + layoutCardLikeBackgroundOpacity,
            }}
          ></Text>
          <Button
            onClick={() => {
              router.back();
            }}
            style={{
              borderRadius: 0,
              borderWidth: 0,
              borderRightWidth: 1,
              position: "absolute",
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
