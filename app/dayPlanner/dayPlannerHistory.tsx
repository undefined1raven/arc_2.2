import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import DayOverviewCard from "@/components/homeDashboardCards/dayOverviewCard";
import { WeekOverview } from "@/components/homeDashboardCards/weekOverview/weekOverview";
import { HabitTracker } from "@/components/homeDashboardCards/habitTracker/habitTracker";
import { TestTile } from "@/components/ui/TestTile";
import { DayPlannerHistoryListView } from "@/components/ui/dayPlanner/DayPlannerHistoryListView";
import { SimpleFooter } from "@/components/common/SimpleFooter";

function DayPlannerHistory() {
  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <DayPlannerHistoryListView></DayPlannerHistoryListView>
        <SimpleFooter label="Back"></SimpleFooter>
      </ThemedView>
    </>
  );
}
export default DayPlannerHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    top: 0,
  },
});
