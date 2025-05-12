import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

function dayPlanner() {
  const dataRetriavalAPI = dataRetrivalApi();

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      <ActivityIndicator></ActivityIndicator>
      <NavMenuBar></NavMenuBar>
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
