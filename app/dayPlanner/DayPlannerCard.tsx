import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { AddIcon } from "@/components/deco/AddIcon";
import CalendarDeco from "@/components/deco/CalendarDeco";
import { StatsDeco } from "@/components/deco/StatsDeco";
import { dayPlannerChunkSize } from "@/components/utils/constants/chunking";
import { TessDayLogType } from "@/constants/CommonTypes";
import { monthToLabel } from "@/constants/time";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function DayPlannerCard() {
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (state) => state.activeDay,
  );
  const recentDays = useDayPlannerActiveDay((store) => store.recentDays);
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const dayPlannerActiveDayApi = useDayPlannerActiveDay();
  const dataRetriavalAPI = dataRetrivalApi();
  const getDateDisplayLabelFromDate = useCallback((date: Date) => {
    const month = monthToLabel[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  }, []);

  ///Used to show continue day instead of start day if the user ends the day too early and wants to restart it.
  const [hasPlanningDayToday, setHasPlanningDayToday] = useState(false);

  useEffect(() => {
    const todayDate = new Date();
    const formattedTodayDate = todayDate.toDateString();

    const todayPlanIndex = recentDays.findIndex(
      (day) => day.day === formattedTodayDate,
    );

    setHasPlanningDayToday(todayPlanIndex !== -1);
  }, [recentDays]);

  const startDay = useCallback(() => {
    const dataRetrivalAPI = dataRetrivalApi.getState();
    const dayPlannerApi = useDayPlannerActiveDay.getState();
    const newDate = new Date();
    const formattedDate = newDate.toDateString();

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
          } else {
            console.error("Failed to create new day");
          }
        })
        .catch((err) => {
          console.error("Error creating new day", err);
        });
    }
  }, [recentDays]);

  const endDay = useCallback(() => {
    if (dayPlannerActiveDay === undefined || dayPlannerActiveDay === null) {
      return;
    }
    const endedDay: TessDayLogType = { ...dayPlannerActiveDay };
    delete endedDay.isActive;
    dataRetriavalAPI
      .modifyEntry(
        "dayPlannerChunks",
        ["day"],
        endedDay.day,
        endedDay,
        undefined,
        "replace",
      )
      .then((r) => {
        useDayPlannerActiveDay.getState().setActiveDay(null);
        console.log("Day ended", r);
        router.replace("/dayPlanner/dayPlanner");
      })
      .catch((e) => {
        router.replace("/dayPlanner/dayPlanner");
        console.error("Error ending day", e);
      });
  }, [dayPlannerActiveDay]);

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
      {dayPlannerActiveDay === undefined && (
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
            label={getDateDisplayLabelFromDate(
              new Date(dayPlannerActiveDay?.day || Date.now()),
            )}
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
            onClick={() => {
              router.push("/dayPlanner/dayPlannerHistory");
            }}
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
          {dayPlannerActiveDay === null ? (
            <Button
              onClick={() => {
                startDay();
              }}
              fontSize={15}
              label={hasPlanningDayToday ? "Continue day" : "Start day"}
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
              onClick={() => {
                endDay();
              }}
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
