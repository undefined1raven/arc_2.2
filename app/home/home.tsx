import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import DayOverviewCard from "@/components/homeDashboardCards/dayOverviewCard";
import { WeekOverview } from "@/components/homeDashboardCards/weekOverview/weekOverview";
import { HabitTracker } from "@/components/homeDashboardCards/habitTracker/habitTracker";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { authenticatedRequest } from "../auth/authenticatedRequest";
import { useActiveUser } from "@/stores/activeUser";
import { getDeviceId } from "@/components/utils/auth/getDeviceId";
import { processMutationServerResponse } from "@/stores/sync/processMutationServerResponse";
import { MutationServerResponse } from "@/stores/sync/outbox";
import { syncPush } from "../sync/syncPush";
import { checkOrInitLocalDeviceId } from "../login/localLogin/checkOrInitLocalDeviceId";

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
  const db = useSQLiteContext();

  useEffect(() => {
    // syncPush();
    checkOrInitLocalDeviceId();
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
