import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { TessDayLogType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DayPlannerCard } from "./DayPlannerCard";
import { DayPlannerChart } from "@/components/ui/dayPlanner/DayPlannerChart";
import { DayPlannerHistoryListView } from "@/components/ui/dayPlanner/DayPlannerHistoryListView";

function dayPlanner() {
  const dataRetriavalAPI = dataRetrivalApi();
  const dayPlannerApi = useDayPlannerActiveDay();
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (store) => store.activeDay,
  );
  const [displayMode, setDisplayMode] = useState<"list" | "visual">("visual");

  useEffect(() => {
    if (dayPlannerActiveDay !== undefined) {
      return;
    }
  }, [dayPlannerActiveDay]);

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      {dayPlannerApi.recentDays.length > 0 && displayMode === "visual" && (
        <DayPlannerChart />
      )}
      {dayPlannerApi.recentDays.length > 0 && displayMode === "list" && (
        <DayPlannerHistoryListView></DayPlannerHistoryListView>
      )}
      <DayPlannerCard
        onSwitchDisplayMode={(newStatus) => {
          setDisplayMode(newStatus);
        }}
        currentSwitchDisplayMode={displayMode}
      ></DayPlannerCard>
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
