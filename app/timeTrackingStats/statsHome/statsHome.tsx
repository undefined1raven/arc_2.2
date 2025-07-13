import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect } from "react";
import { useTimeStatsData } from "@/stores/viewState/timeStatsData";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { FlashList } from "@shopify/flash-list";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { router } from "expo-router";
function Home() {
  const hasTimeTrackingData = useTimeStatsData(
    (s) => s.dataInTimeRange !== null
  );
  const viewData = useTimeStatsData((s) => s.viewRange);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const setActiveDayView = useTimeStatsData((s) => s.setActiveDayView);
  useEffect(() => {
    const timeStatsApi = useTimeStatsData.getState();
    const dataRetrivalAPI = dataRetrivalApi.getState();
    if (timeStatsApi.dataInTimeRange === null) {
      console.log("Fetching time tracking data for the last week");
      const queryStartTime = Date.now();
      const lastWeekStartAtMidnight = new Date();
      lastWeekStartAtMidnight.setDate(lastWeekStartAtMidnight.getDate() - 7);
      lastWeekStartAtMidnight.setHours(0, 0, 0, 0);
      dataRetrivalAPI
        .getDataInTimeRange(
          "timeTrackingChunks",
          lastWeekStartAtMidnight.getTime(),
          Date.now(),
          null
        )
        .then((data) => {
          if (data.status !== "success" || !data.payload) {
            console.error("Failed to fetch time tracking data");
            return;
          }
          console.log(
            `Time tracking data fetched in ${
              Date.now() - queryStartTime
            } ms | `,
            data.payload.length + " records"
          );

          timeStatsApi.setDataInTimeRange(data.payload);
        })
        .catch((error) => {
          console.error("Error fetching time tracking data:", error);
        });
    }
  }, []);

  const renderItem = useCallback(({ item }) => {
    const typedItem = item as string;
    const getDisplayText = (text: string) => {
      const date = new Date(text);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    };
    return (
      <Button
        style={{
          width: "100%",
          height: 50,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 10,
        }}
        onClick={() => {
          setActiveDayView(typedItem);
          router.push("/timeTrackingStats/statsDayView/timeTrackingDayView");
        }}
        label=""
      >
        <Text
          fontSize={globalStyle.regularMobileFont}
          label={getDisplayText(typedItem)}
        />
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
                  height: 10,
                }}
              />
            )}
            data={viewData}
            renderItem={renderItem}
          ></FlashList>
        </View>
        {/* <Animated.View
          entering={FadeInUp}
          style={{
            height: 60,
            width: "100%",
            borderRadius: globalStyle.borderRadius,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        ></Animated.View> */}
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
