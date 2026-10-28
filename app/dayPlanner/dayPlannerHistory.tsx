import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { DayPlannerHistoryListView } from "@/components/ui/dayPlanner/DayPlannerHistoryListView";
import { SimpleFooter } from "@/components/common/SimpleFooter";
import { useCallback, useState } from "react";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import Button from "@/components/common/Button";
import DayPlannerGraph from "./dayPlannerHistoryGraph";

function DayPlannerHistory() {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  const onViewModeToggle = useCallback(() => {
    if (viewMode === "graph") {
      setViewMode("list");
    } else {
      setViewMode("graph");
    }
  }, [viewMode]);

  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        {viewMode === "list" ? (
          <DayPlannerHistoryListView></DayPlannerHistoryListView>
        ) : (
          <DayPlannerGraph></DayPlannerGraph>
        )}
        <View
          style={{
            width: "100%",
            marginLeft: 5,
            marginRight: 5,
            height: 40,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 15,
            flexDirection: "row",
          }}
        >
          <Text
            fontSize={globalStyle.mediumMobileFont}
            label="View Mode"
            textAlign="left"
            style={{
              width: "50%",
              height: "100%",
              paddingRight: 20,
              paddingLeft: 20,
              backgroundColor:
                globalStyle.color + layoutCardLikeBackgroundOpacity,
            }}
          ></Text>
          <View
            style={{
              flexDirection: "row",
              display: "flex",
              height: "100%",
              flex: 1,
              gap: 10,
            }}
          >
            <Button
              onClick={onViewModeToggle}
              color={
                viewMode === "list"
                  ? globalStyle.color
                  : globalStyle.colorAccent
              }
              borderColor={
                viewMode === "list"
                  ? globalStyle.color
                  : globalStyle.colorAccent
              }
              fontSize={globalStyle.mediumMobileFont}
              style={{
                height: "100%",
                flex: 1,
                borderTopWidth: 0,
                borderBottomWidth: 0,
              }}
              label="List"
            ></Button>
            <Button
              onClick={onViewModeToggle}
              color={
                viewMode === "graph"
                  ? globalStyle.color
                  : globalStyle.colorAccent
              }
              borderColor={
                viewMode === "graph"
                  ? globalStyle.color
                  : globalStyle.colorAccent
              }
              fontSize={globalStyle.mediumMobileFont}
              style={{
                height: "100%",
                flex: 1,
                borderTopWidth: 0,
                borderBottomWidth: 0,
              }}
              label="Charts"
            ></Button>
          </View>
        </View>
        <SimpleFooter label="History"></SimpleFooter>
      </ThemedView>
    </>
  );
}
export default DayPlannerHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    top: 0,
  },
});
