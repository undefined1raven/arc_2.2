// components/functional/CriticalSyncOverlay.tsx
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Portal } from "react-native-portalize";
import { useTransferStore } from "@/stores/dataSyncApi";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Text from "@/components/common/Text";
import { SimpleDonutChart } from "@/components/common/SimpleDonutChart";
import { useCallback } from "react";

export function CriticalSyncOverlay() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const criticalSyncInProgress = useTransferStore(
    (state) =>
      state.tasks.filter(
        (t) => t.type === "download" && t.status === "in-progress"
      ).length > 0
  );
  const transferTasks = useTransferStore((state) => state.tasks);

  const progressPercentage = useCallback(() => {
    const totalDownloadTasks = transferTasks.length;
    if (totalDownloadTasks === 0) return 0;
    const completedTasks = transferTasks.filter(
      (task) =>
        task.status !== "in-progress" &&
        task.status !== "pending" &&
        task.type === "download"
    ).length;
    return Math.round((completedTasks / totalDownloadTasks) * 100);
  }, [transferTasks]);

  if (!criticalSyncInProgress) return null;

  return (
    <Portal>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <View style={{ width: "100%", height: 50 }}>
          <Text
            label="Downloading user data"
            fontSize={globalStyle.largeMobileFont}
          ></Text>
        </View>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <SimpleDonutChart
            max={100}
            min={0}
            style={{ width: 75, height: 75 }}
            value={progressPercentage()}
            thickness={2}
            color={globalStyle.color}
            backgroundColor={globalStyle.color + "20"}
          ></SimpleDonutChart>
          <Text
            color={globalStyle.textColorAccent}
            label={`${progressPercentage()}% `}
            fontSize={globalStyle.largeMobileFont}
          ></Text>
        </View>
      </ThemedView>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
