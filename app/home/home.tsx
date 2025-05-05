import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ThemedView } from "@/components/ThemedView";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useActiveUser } from "@/stores/activeUser";
import { charCodeArrayToString } from "@/components/utils/fn/charOps";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import DataSetter from "@/components/DataSetter";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import {
  dayPlannerChunkSize,
  timeTrackingChunkSize,
} from "@/components/utils/constants/chunking";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTrackingCard";
function Home() {
  const dataRetrivalApix = dataRetrivalApi();
  const featureConfigApi = useFeatureConfigs();
  return (
    <>
      <ThemedView style={styles.container}>
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
    justifyContent: "center",
    paddingLeft: 5,
    paddingRight: 5,
  },
});
