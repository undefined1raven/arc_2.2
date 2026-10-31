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
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePickerModal } from "react-native-paper-dates";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  SlideInUp,
} from "react-native-reanimated";

function DayPlannerHistoryListView() {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const recentDayPlannerData = useDayPlannerActiveDay((s) => s.recentDays);
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (f) => f.dayPlannerFeatureConfig,
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const recentDays = useDayPlannerActiveDay((r) => r.recentDays);
  const timeRange = useDayPlannerActiveDay((r) => r.dataTimeRange);
  const onDismiss = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const getDisplayLabelFromDay = useCallback((unix: number) => {
    const date = new Date(unix);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  const onConfirmTimeRange = useCallback(
    (newRange: { endDate: string; startDate: string }) => {
      const startDate = new Date(newRange.startDate).getTime();
      const endDate = new Date(newRange.endDate).getTime();
      const dayPlannerApi = useDayPlannerActiveDay.getState();
      dayPlannerApi.setDataTimeRange([startDate, endDate]);
      setIsDatePickerOpen(false);
    },
    [],
  );

  const renderItem = useCallback(({ item }: { item: TessDayLogType }) => {
    const completionPercentage = computeDayPlannerCompletion(
      dayPlannerFeatureConfig,
      item,
    );

    const isEmptyDay = item.tasks.length === 0;

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
          borderWidth: isEmptyDay ? 0 : 1,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          paddingRight: 10,
          paddingLeft: 10,
          borderRadius: globalStyle.borderRadius,
          backgroundColor: isEmptyDay
            ? globalStyle.colorInactive + layoutCardLikeBackgroundOpacity
            : undefined,
        }}
      >
        <Button
          disabled={isEmptyDay}
          onClick={() => {
            if (isEmptyDay) return;
            const dayPlannerAPI = useDayPlannerActiveDay.getState();
            dayPlannerAPI.setHistoricDayView(item);
            router.push("/dayPlanner/historicDayView");
          }}
          style={{
            zIndex: 3,
            position: "absolute",
            width: "100%",
            height: "100%",
            borderWidth: 0,
            display: "flex",
            justifyContent: "space-between",
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
          <Text
            color={
              isEmptyDay ? globalStyle.textColorInactive : globalStyle.textColor
            }
            fontSize={globalStyle.mediumMobileFont}
            label={item.day}
          ></Text>
          {isEmptyDay === false && (
            <Text
              fontSize={globalStyle.smallMobileFont}
              label={`${item.tasks.length} tasks`}
            ></Text>
          )}
        </View>
        {isEmptyDay === false && (
          <View style={{ width: 30, height: 30 }}>
            <SimpleDonutChart
              style={{ height: 30, width: 30 }}
              thickness={4}
              min={0}
              max={100}
              backgroundColor={globalStyle.colorAccent}
              color={globalStyle.color}
              value={parseFloat(completionPercentage)}
            ></SimpleDonutChart>
          </View>
        )}
        {isEmptyDay === true && (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              color={globalStyle.textColorInactive}
              label="No tasks"
              fontSize={globalStyle.mediumMobileFont}
            ></Text>
          </View>
        )}
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
        display: "flex",
        width: "100%",
        height: "100%",
        gap: 10,
        marginBottom: 5,
      }}
    >
      <Animated.View
        entering={FadeInUp.duration(100)}
        style={{
          width: "100%",
          display: "flex",
          flexGrow: 1,
        }}
      >
        <FlashList
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                label="No Data In Selected Period"
                textAlign="center"
                style={{
                  width: "100%",
                  transform: [{ rotate: "180deg" }],
                  paddingVertical: 15,
                  backgroundColor:
                    globalStyle.color + layoutCardLikeBackgroundOpacity,
                }}
              ></Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          estimatedItemSize={60}
          inverted={true}
          data={recentDays ?? []}
          renderItem={renderItem}
          ItemSeparatorComponent={separatorRenderItem}
        ></FlashList>
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
          onClick={() => {
            setIsDatePickerOpen(true);
          }}
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
      </Animated.View>
      <View
        style={{
          width: "100%",
          height: 1,
          backgroundColor: globalStyle.colorAccent,
        }}
      ></View>
      <DatePickerModal
        locale="en"
        mode="range"
        visible={isDatePickerOpen}
        onDismiss={onDismiss}
        saveLabel="Save"
        label="Pick data range"
        startDate={
          recentDayPlannerData[0]?.day
            ? new Date(recentDayPlannerData[0]?.day)
            : new Date()
        }
        endDate={
          recentDayPlannerData[recentDayPlannerData.length - 1]?.day
            ? new Date(
                recentDayPlannerData[recentDayPlannerData.length - 1]?.day,
              )
            : new Date()
        }
        onConfirm={onConfirmTimeRange}
      />
    </View>
  );
}

export { DayPlannerHistoryListView };
