import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { TessDayLogType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { DayPlannerCard } from "./DayPlannerCard";

function dayPlanner() {
  const dataRetriavalAPI = dataRetrivalApi();
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (store) => store.activeDay
  );
  useEffect(() => {
    if (dayPlannerActiveDay !== undefined) {
      return;
    }
    dataRetriavalAPI
      .getDataInTimeRange("dayPlannerChunks", undefined, undefined, 1)
      .then((res) => {
        console.log("Current active day", res.payload[0]);
        if (res.status === "success") {
          const data = res.payload;
          const currentActiveDay: TessDayLogType = data?.find(
            (day) => day.isActive === true
          );
          if (currentActiveDay) {
            console.log("Active day found", currentActiveDay.day);
            useDayPlannerActiveDay.getState().setActiveDay(currentActiveDay);
          } else {
            useDayPlannerActiveDay.getState().setActiveDay(null);
            console.log("No active day found");
          }
        }
      })
      .catch((err) => {});
  }, [dayPlannerActiveDay]);

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
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
