import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { TessDayLogType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DayPlannerCard } from "./DayPlannerCard";
import { DayPlannerChart } from "@/components/ui/dayPlanner/DayPlannerChart";

function dayPlanner() {
  const dataRetriavalAPI = dataRetrivalApi();
  const dayPlannerApi = useDayPlannerActiveDay();
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (store) => store.activeDay
  );

  useEffect(() => {
    if (dayPlannerActiveDay !== undefined) {
      return;
    }

    dataRetriavalAPI
      .getDataInTimeRange("dayPlannerChunks", null, null, 1)
      .then((res) => {
        if (res.status === "success") {
          const data = res.payload;
          const currentActiveDay: TessDayLogType = data?.find(
            (day) => day.isActive === true
          );

          if (currentActiveDay) {
            console.log("Active day found", currentActiveDay.day);
            dayPlannerApi.setActiveDay(currentActiveDay);
          } else {
            dayPlannerApi.setActiveDay(null);
            console.log("No active day found");
          }
        }
      })
      .catch((err) => {});

    dataRetriavalAPI
      .getDataInTimeRange("dayPlannerChunks", null, null, 3)
      .then((res) => {
        //@ts-ignore
        dayPlannerApi.setRecentDays(res.payload || []);
      });
  }, [dayPlannerActiveDay]);

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      <View style={{ flex: 1 }}>
        <DayPlannerChart />
      </View>
      <DayPlannerCard></DayPlannerCard>
    </ThemedView>
  );
}
export default dayPlanner;

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
