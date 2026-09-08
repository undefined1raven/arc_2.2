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
    const userid = useActiveUser.getState().activeUser.userId;
    const deviceid = getDeviceId();
    db.getAllAsync("SELECT * FROM syncOutbox").then((r) => {
      console.log("OUTBOX ITEMS", r);
      authenticatedRequest("/sync/push", {
        method: "POST",
        body: JSON.stringify({
          mutations: r,
          userId: userid,
          deviceId: deviceid,
        }),
      }).then((response) => {
        if (response.status === "success") {
          console.log("Request successful:", response.json);
        } else {
          console.error("Request failed:", response.error);
        }
      });
    });
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
