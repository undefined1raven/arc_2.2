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
        height: "100%",
        width: "100%",
        display: "flex",
        gap: 10,
        marginBottom: 5,
      }}
    >
      <View
        style={{
          width: "100%",
          display: "flex",
          flexGrow: 1,
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
      <View
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
            flex: 1,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
          }}
        ></Text>
        <Button
          style={{
            flex: 1,
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
            label="21 Oct"
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
            label="29 Oct"
            style={{ flex: 2, zIndex: -1 }}
            fontSize={globalStyle.mediumMobileFont}
          ></Text>
        </Button>
      </View>
      <View
        style={{
          width: "100%",
          height: 1,
          backgroundColor: globalStyle.colorAccent,
        }}
      ></View>
    </View>
  );
}

export { DayPlannerHistoryListView };
