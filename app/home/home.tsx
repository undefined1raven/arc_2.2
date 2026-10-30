import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import DayOverviewCard from "@/components/homeDashboardCards/dayOverviewCard";
import { WeekOverview } from "@/components/homeDashboardCards/weekOverview/weekOverview";
import { HabitTracker } from "@/components/homeDashboardCards/habitTracker/habitTracker";
import { useEffect } from "react";
import { syncCall } from "../sync/syncCall";
import { loadDiaryGroups } from "../functions/onLoginOnce";
import { useDiaryData } from "@/stores/diary/diary";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    top: 0,
  },
});

function Home() {
  const diaryApi = useDiaryData();

  /// Lazy load diary data to improve performance on startup
  useEffect(() => {
    if (diaryApi.notes === null) {
      const timeout = setTimeout(() => {
        void loadDiaryGroups();
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <HabitTracker></HabitTracker>
        <WeekOverview></WeekOverview>
        <DayOverviewCard></DayOverviewCard>
        <TimeTrackingCard></TimeTrackingCard>
      </ThemedView>
    </>
  );
}
export default Home;
