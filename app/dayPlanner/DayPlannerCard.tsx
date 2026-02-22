import Button from "@/components/common/Button";
import { SimpleDonutChart } from "@/components/common/SimpleDonutChart";
import Text from "@/components/common/Text";
import { BackupFileDeco } from "@/components/deco/BackupFileDeco";
import CalendarDeco from "@/components/deco/CalendarDeco";
import { EditDeco } from "@/components/deco/EditDeco";
import { ListDeco } from "@/components/deco/ListDeco";
import { StatsDeco } from "@/components/deco/StatsDeco";
import { dayPlannerChunkSize } from "@/components/utils/constants/chunking";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { TessDayLogType } from "@/constants/CommonTypes";
import { monthToLabel } from "@/constants/time";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

function DayPlannerCard() {
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (store) => store.dayPlannerFeatureConfig,
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

  const getDateDisplayLabelFromDate = useCallback((date: Date) => {
    const month = monthToLabel[date.getMonth()];
    const day = date.getDate();
    return `Today | ${month} ${day}`;
  }, []);

  const startDay = useCallback(() => {
    const dataRetrivalAPI = dataRetrivalApi.getState();
    const dayPlannerApi = useDayPlannerActiveDay.getState();
    const newDate = new Date();
    const formattedDate = newDate.toDateString();
    const recentDays = dayPlannerApi.recentDays;

    const todayDayIndex = recentDays.findIndex(
      (day) => day.day === formattedDate,
    );

    if (todayDayIndex !== -1) {
      const existingDay = recentDays[todayDayIndex];
      existingDay.isActive = true;
      dataRetrivalAPI
        .modifyEntry(
          "dayPlannerChunks",
          ["day"],
          formattedDate,
          existingDay,
          undefined,
          "replace",
        )
        .then((res) => {
          dayPlannerApi.setActiveDay(existingDay);
          router.push("/activeDayView/activeDayView");
        })
        .catch((err) => {
          console.error("Error updating existing day", err);
        });
    } else {
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
    }
  }, []);

  return (
    <View
      style={{
        borderTopColor: globalStyle.color + "40",
        borderTopWidth: 1,
        width: "100%",
        borderRadius: globalStyle.borderRadius,
        height: "auto",
        maxHeight: 120,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
      }}
    >
      {dayPlannerActiveDayApi.activeDay === undefined && (
        <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
      )}

      <View
        style={{
          width: "100%",
          height: "55px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <CalendarDeco width={28} height={28}></CalendarDeco>
          <Text
            style={{ marginLeft: 5 }}
            label={getDateDisplayLabelFromDate(new Date())}
          ></Text>
        </View>
        <View
          style={{
            height: "90%",
            flex: 1,
            width: "100%",
            display: "flex",
            gap: 10,
            flexDirection: "row",
          }}
        >
          <Button
            onClick={() => {}}
            backgroundColor={globalStyle.colorAccent + "15"}
            style={{
              height: "100%",
              display: "flex",
              flex: 1,
              justifyContent: "center",
              borderTopWidth: 0,
              borderBottomWidth: 0,
              alignItems: "center",
            }}
          >
            <StatsDeco width={35} height={25}></StatsDeco>
          </Button>
          {dayPlannerActiveDayApi.activeDay === null ? (
            <Button
              onClick={() => {
                startDay();
              }}
              fontSize={15}
              label="Start day"
              backgroundColor={globalStyle.colorAccent + "15"}
              style={{
                flex: 2,
                height: "100%",
                display: "flex",
                justifyContent: "center",
                borderTopWidth: 0,
                borderBottomWidth: 0,
                alignItems: "center",
              }}
            ></Button>
          ) : (
            <Button
              onClick={() => {}}
              fontSize={15}
              label="End day"
              color={globalStyle.errorColor}
              borderColor={globalStyle.errorColor}
              backgroundColor={globalStyle.errorColor + "15"}
              style={{
                flex: 2,
                height: "100%",
                display: "flex",
                justifyContent: "center",
                borderTopWidth: 0,
                borderBottomWidth: 0,
                alignItems: "center",
              }}
            ></Button>
          )}
        </View>
      </View>
    </View>
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
