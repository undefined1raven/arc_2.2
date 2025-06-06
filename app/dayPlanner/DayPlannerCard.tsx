import Button from "@/components/common/Button";
import { SimpleDonutChart } from "@/components/common/SimpleDonutChart";
import Text from "@/components/common/Text";
import { BackupFileDeco } from "@/components/deco/BackupFileDeco";
import CalendarDeco from "@/components/deco/CalendarDeco";
import { EditDeco } from "@/components/deco/EditDeco";
import { StatsDeco } from "@/components/deco/StatsDeco";
import { dayPlannerChunkSize } from "@/components/utils/constants/chunking";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { layoutAnimationsDuration } from "@/constants/animations";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { TessDayLogType } from "@/constants/CommonTypes";
import { monthToLabel } from "@/constants/time";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useDayPlannerStatusToEdit } from "@/stores/viewState/dayPlannerActiveStatusToEdit";
import { router } from "expo-router";
import React, { act, useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

function DayPlannerCard() {
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (store) => store.dayPlannerFeatureConfig
  );
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const dayPlannerActiveDayApi = useDayPlannerActiveDay();
  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);
  const [dayCompletionPercentage, setDayCompletionPercentage] =
    React.useState<number>(0);
  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  useEffect(() => {
    if (
      dayPlannerActiveDayApi.activeDay === undefined ||
      dayPlannerActiveDayApi.activeDay === null
    ) {
      return;
    }
    const dayCompletion = computeDayPlannerCompletion(
      dayPlannerFeatureConfig,
      dayPlannerActiveDayApi.activeDay
    );
    setDayCompletionPercentage(dayCompletion);
  }, [dayPlannerActiveDayApi.activeDay, dayPlannerFeatureConfig]);

  const getDateDisplayLabelFromDate = useCallback((date: Date) => {
    const month = monthToLabel[date.getMonth()];
    const day = date.getDate();
    return `Today | ${month} ${day}`;
  }, []);

  const startDay = useCallback(() => {
    const dataRetrivalAPI = dataRetrivalApi.getState();
    const newDate = new Date();
    const formattedDate = newDate.toDateString();
    const newDay: TessDayLogType = {
      day: formattedDate,
      isActive: true,
      tasks: [],
    };
    dataRetrivalAPI
      .appendEntry("dayPlannerChunks", newDay, dayPlannerChunkSize)
      .then((res) => {
        if (res.status === "success") {
          console.log("New day created successfully");
          dayPlannerActiveDayApi.setActiveDay(newDay);
          router.push("/activeDayView/activeDayView");
        } else {
          console.error("Failed to create new day");
        }
      })
      .catch((err) => {
        console.error("Error creating new day", err);
      });
  }, []);

  const getColorsFromCompletionPercentage = useCallback(
    (completionPercentage: number) => {
      if (completionPercentage < 25) {
        return {
          textColor: globalStyle.errorTextColor,
          color: globalStyle.errorColor,
        };
      } else if (completionPercentage < 75) {
        return {
          textColor: globalStyle.warningTextColor,
          color: globalStyle.warningColor,
        };
      } else {
        return {
          textColor: globalStyle.successTextColor,
          color: globalStyle.successColor,
        };
      }
    },
    []
  );

  return (
    <Animated.View
      style={{
        backgroundColor: globalStyle.color + layoutCardLikeBackgroundOpacity,
        width: "100%",
        borderRadius: globalStyle.borderRadius,
        height: "20%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
      }}
    >
      {dayPlannerActiveDayApi.activeDay === undefined && (
        <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
      )}
      {dayPlannerActiveDayApi.activeDay !== undefined && (
        <View
          style={{
            width: "100%",
            height: "30%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text
            fontSize={globalStyle.mediumMobileFont}
            label="Day Planner"
          ></Text>
          <View
            style={{
              height: "100%",
              display: "flex",
              gap: 5,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => {
                router.push("/dayPlanner/statusEditor/statusEditor");
              }}
              style={styles.contextButtonStyle}
            >
              <EditDeco width={35} height={25}></EditDeco>
            </Button>
            <Button onClick={() => {}} style={styles.contextButtonStyle}>
              <StatsDeco width={35} height={25}></StatsDeco>
            </Button>
          </View>
        </View>
      )}
      {dayPlannerActiveDayApi.activeDay === null && (
        <View
          style={{
            width: "100%",
            height: "70%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              height: "20%",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <CalendarDeco width={28} height={28}></CalendarDeco>
            <Text
              style={{ marginLeft: 5 }}
              label={getDateDisplayLabelFromDate(new Date())}
            ></Text>
          </View>
          <Button
            onClick={startDay}
            label="Start Day"
            style={{ height: "40%", width: "80%", marginTop: 15 }}
          ></Button>
        </View>
      )}
      {dayPlannerActiveDayApi.activeDay !== null &&
        dayPlannerActiveDayApi.activeDay !== undefined && (
          <View
            style={{
              width: "100%",
              height: "70%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "80%",
                height: "20%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ display: "flex", flexDirection: "row" }}>
                <CalendarDeco width={28} height={28}></CalendarDeco>
                <Text
                  style={{ marginLeft: 5 }}
                  label={getDateDisplayLabelFromDate(
                    new Date(dayPlannerActiveDayApi.activeDay.day)
                  )}
                ></Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexGrow: 1,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 5,
                }}
              >
                <Text
                  color={
                    getColorsFromCompletionPercentage(dayCompletionPercentage)
                      .textColor
                  }
                  textAlign="left"
                  style={{
                    backgroundColor:
                      getColorsFromCompletionPercentage(dayCompletionPercentage)
                        .color + "00",
                  }}
                  fontSize={globalStyle.mediumMobileFont}
                  label={`${dayCompletionPercentage}% completed`}
                ></Text>
                <SimpleDonutChart
                  value={dayCompletionPercentage}
                  min={0}
                  max={100}
                  style={{
                    width: 25,
                    height: 25,
                  }}
                  color={
                    getColorsFromCompletionPercentage(dayCompletionPercentage)
                      .color
                  }
                  backgroundColor={
                    getColorsFromCompletionPercentage(dayCompletionPercentage)
                      .color + "50"
                  }
                  thickness={4}
                ></SimpleDonutChart>
              </View>
            </View>
            <Button
              onClick={() => {
                const activeDay = dayPlannerActiveDayApi.activeDay;
                if (activeDay === null || activeDay === undefined) {
                  return;
                }
                if (Object.keys(activeDay).length > 0) {
                  router.push("/activeDayView/activeDayView");
                }
              }}
              label="View Day"
              style={{ height: "40%", width: "80%", marginTop: 15 }}
            ></Button>
          </View>
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contextButtonStyle: {
    width: "20%",
    height: "80%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
});

export { DayPlannerCard };
