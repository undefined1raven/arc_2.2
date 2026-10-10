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
import { processMutationServerResponse } from "@/stores/sync/processMutationServerResponse";
import { MutationServerResponse } from "@/stores/sync/outbox";
import { syncPush } from "../sync/syncPush";
import { checkOrInitLocalDeviceId } from "../login/localLogin/checkOrInitLocalDeviceId";
import * as SecureStore from "expo-secure-store";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { decryptAccountPrivateKey } from "@/components/utils/crypto/decryptAccountPrivateKey";
import { getLocalCache } from "@/components/utils/localDb";
import { syncPull } from "../sync/syncPull";
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
  useEffect(() => {
    getLocalCache().then((db) => {
      db.getAllAsync(`SELECT * FROM deviceIds`).then((rows) => {
        console.log("deviceIds in local db", rows);
      });
    });
    syncPull();
    syncPush();
    // checkOrInitLocalDeviceId();
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
