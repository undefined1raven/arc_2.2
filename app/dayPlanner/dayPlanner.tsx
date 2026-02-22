import { ThemedView } from "@/components/ThemedView";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DayPlannerCard } from "./DayPlannerCard";

function dayPlanner() {
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
    gap: 5,
    top: 0,
  },
});
