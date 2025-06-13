import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { Selection } from "@/components/common/Selection";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
function Home() {
  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <HabitCard></HabitCard>
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
