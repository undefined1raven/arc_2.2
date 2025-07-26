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
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import DatePicker from "react-native-date-picker";
import CalendarDeco from "@/components/deco/CalendarDeco";
import { BarChart } from "react-native-gifted-charts";
import { BarChartDeco } from "@/components/deco/BarChartDeco";
function Home() {
  const [customTimeRangeStart, setCustomTimeRangeStart] = useState<
    string | null
  >(null);

  const hasTimeTrackingData = useTimeStatsData(
    (s) => s.dataInTimeRange !== null
  );
  const viewData = useTimeStatsData((s) => s.viewRange);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const setActiveDayView = useTimeStatsData((s) => s.setActiveDayView);
  const isFetchingData = useTimeStatsData((s) => s.isFetchingData);
  const getDataInTimeRange = useCallback(
    (timeRangeStart: number, timeRangeEnd: number) => {
      const timeStatsApi = useTimeStatsData.getState();
      const dataRetrivalAPI = dataRetrivalApi.getState();
      timeStatsApi.setIsFetchingData(true);
      dataRetrivalAPI
        .getDataInTimeRange(
          "timeTrackingChunks",
          timeRangeStart,
          timeRangeEnd,
          null
        )
        .then((data) => {
          timeStatsApi.setIsFetchingData(false);
          if (data.status !== "success" || !data.payload) {
            console.error("Failed to fetch time tracking data");
            return;
          }
          timeStatsApi.setDataInTimeRange(data.payload);
        })
        .catch((error) => {
          console.error("Error fetching time tracking data:", error);
        });
    },
    []
  );

  useEffect(() => {
    const timeStatsApi = useTimeStatsData.getState();
    if (timeStatsApi.dataInTimeRange === null) {
      const lastWeekStartAtMidnight = new Date();
      lastWeekStartAtMidnight.setDate(lastWeekStartAtMidnight.getDate() - 14);
      lastWeekStartAtMidnight.setHours(0, 0, 0, 0);
      getDataInTimeRange(lastWeekStartAtMidnight.getTime(), Date.now());
    }
  }, []);

  const getDisplayText = useMemo(() => {
    return (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    };
  }, []);

  useEffect(() => {
    if (customTimeRangeStart === null) return;
    const timeRangeStart = new Date(customTimeRangeStart).getTime();
    const timeRangeEnd = new Date(timeRangeStart);
    timeRangeEnd.setDate(timeRangeEnd.getDate() + 14);
    getDataInTimeRange(timeRangeStart, timeRangeEnd.getTime());
  }, [customTimeRangeStart]);

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
          fontSize={globalStyle.regularMobileFont}
          label={getDisplayText(typedItem)}
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
        {hasTimeTrackingData === false && (
          <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
        )}
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
            justifyContent: "space-between",
            flexDirection: "row",
            paddingLeft: 10,
            borderRadius: globalStyle.borderRadius,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        >
          <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
            <Text
              label={`${getDisplayText(
                viewData[viewData.length - 1]
              )} - ${getDisplayText(viewData[0])}`}
            ></Text>
            {isFetchingData && (
              <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
            )}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              height: "100%",
            }}
          >
            <Button
              fontSize={globalStyle.regularMobileFont}
              style={{
                width: 80,
                height: "100%",
                borderWidth: 0,
                borderLeftWidth: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
              }}
              onClick={() => {}}
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
                width: 130,
                height: "100%",
                borderWidth: 0,
                borderLeftWidth: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
              }}
              onClick={() => {
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                DateTimePickerAndroid.open({
                  value: twoWeeksAgo,
                  maximumDate: new Date(),
                  onChange: (event, date) => {
                    if (event.type === "set" && date) {
                      setCustomTimeRangeStart(date.toISOString().split("T")[0]);
                    }
                  },
                });
              }}
            >
              <CalendarDeco style={{ zIndex: -1 }}></CalendarDeco>
              <Text
                style={{ zIndex: -1 }}
                fontSize={globalStyle.regularMobileFont}
                label={getDisplayText(viewData[viewData.length - 1])}
              ></Text>
            </Button>
          </View>
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
