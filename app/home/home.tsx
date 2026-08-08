import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import DayOverviewCard from "@/components/homeDashboardCards/dayOverviewCard";
import { WeekOverview } from "@/components/homeDashboardCards/weekOverview/weekOverview";
import { HabitTracker } from "@/components/homeDashboardCards/habitTracker/habitTracker";
import { useEffect } from "react";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";

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
