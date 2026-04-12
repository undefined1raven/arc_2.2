import Button from "@/components/common/Button";
import { SimpleDonutChart } from "@/components/common/SimpleDonutChart";
import Text from "@/components/common/Text";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { TessDayLogType } from "@/constants/CommonTypes";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

function DayPlannerHistoryListView() {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const recentDayPlannerData = useDayPlannerActiveDay((s) => s.recentDays);
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (f) => f.dayPlannerFeatureConfig,
  );
  const recentDays = useDayPlannerActiveDay((r) => r.recentDays);

  const renderItem = useCallback(({ item }: { item: TessDayLogType }) => {
    const completionPercentage = computeDayPlannerCompletion(
      dayPlannerFeatureConfig,
      item,
    );
    return (
      <View
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: 60,
          flexDirection: "row",
          borderColor: globalStyle.color,
          borderWidth: 1,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          paddingRight: 5,
          paddingLeft: 5,
          borderRadius: globalStyle.borderRadius,
        }}
      >
        <Button
          onClick={() => {
            const dayPlannerAPI = useDayPlannerActiveDay.getState();
            dayPlannerAPI.setHistoricDayView(item);
            router.push("/dayPlanner/historicDayView");
          }}
          style={{
            zIndex: 3,
            position: "absolute",
            width: "105%",
            height: "100%",
            borderWidth: 0,
          }}
        ></Button>
        <View
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          <Text fontSize={globalStyle.mediumMobileFont} label={item.day}></Text>
          <Text
            fontSize={globalStyle.smallMobileFont}
            label={`${item.tasks.length > 0 ? item.tasks.length : "No"} tasks`}
          ></Text>
        </View>
        <View style={{ width: 30, height: 30 }}>
          {item.tasks.length ? (
            <SimpleDonutChart
              style={{ height: 30, width: 30 }}
              thickness={2}
              min={0}
              max={100}
              backgroundColor={globalStyle.colorInactive + 25}
              color={globalStyle.color}
              value={parseFloat(completionPercentage)}
            ></SimpleDonutChart>
          ) : null}
        </View>
      </View>
    );
  }, []);
  const separatorRenderItem = useCallback(
    ({ item }: { item: TessDayLogType }) => {
      return <View style={{ width: "100%", height: 10 }}></View>;
    },
    [],
  );

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        gap: 5,
      }}
    >
      <FlashList
        estimatedItemSize={60}
        inverted={true}
        data={recentDays ?? []}
        renderItem={renderItem}
        ItemSeparatorComponent={separatorRenderItem}
      ></FlashList>
    </View>
  );
}

export { DayPlannerHistoryListView };
