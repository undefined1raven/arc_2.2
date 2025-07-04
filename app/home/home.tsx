import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import { AfterInteractions } from "react-native-interactions";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";

function Home() {
  const db = useSQLiteContext();

  // useEffect(() => {
  //   console.log("RUNNING");
  //   db.getAllAsync(
  //     "SELECT timeRangeStart, timeRangeEnd FROM timeTrackingChunks"
  //   )
  //     .then((r) => {
  //       const da = dataRetrivalApi.getState();
  //       da.specialOps("getTimeRanges")
  //         .then((r) => {
  //           console.log("Modified timeTrackingChunks:", r);
  //         })
  //         .catch((e) => {
  //           console.log("Error modifying timeTrackingChunks:", e);
  //         });
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     });
  // }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <AfterInteractions>
          <HabitCard></HabitCard>
        </AfterInteractions>
        <TimeTrackingCard></TimeTrackingCard>
      </ThemedView>
    </>
  );
}
export default Home;

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
