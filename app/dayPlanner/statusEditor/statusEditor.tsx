import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { TessDayLogType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

function statusEditor() {
  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      <ActivityIndicator></ActivityIndicator>
    </ThemedView>
  );
}
export default statusEditor;

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
