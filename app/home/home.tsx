import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import { AfterInteractions } from "react-native-interactions";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { TestComp } from "@/components/TempTest";
import { useStatusIndicatorStore } from "@/stores/statusIndicatorStore";

function Home() {
  const db = useSQLiteContext();

  ////TEMP
  useEffect(() => {
    const dataRetrival = dataRetrivalApi.getState();

    db.getAllAsync('SELECT id FROM "timeTrackingChunks"')
      .then((data) => {
        db.getFirstAsync(
          'SELECT id, timeRangeStart, timeRangeEnd FROM "timeTrackingChunks"'
        )
          .then(() => {
            console.log("Time range already exists in timeTrackingChunks");
          })
          .catch((error) => {
            const hasTimeRange =
              data[0]?.timeRangeStart !== undefined &&
              data[0]?.timeRangeEnd !== undefined;
            if (hasTimeRange) {
              console.log("Time range already exists in timeTrackingChunks");
              return;
            }
            const chunkIds = data.map((item) => item.id);

            const BATCH_SIZE = 50;

            const processBatch = async (startIndex: number) => {
              const statusIndicator = useStatusIndicatorStore.getState();
              statusIndicator.setIsSavingLocalData(true);

              if (startIndex >= chunkIds.length) {
                console.log("All chunks processed");
                statusIndicator.setIsSavingLocalData(false);
                return;
              }

              const batch = chunkIds.slice(startIndex, startIndex + BATCH_SIZE);
              try {
                const result = await dataRetrival.getChunkTimeRange(
                  "timeTrackingChunks",
                  batch
                );
                if (result.status === "success") {
                } else {
                  console.error(
                    "Error fetching chunk time range:",
                    result.error
                  );
                }

                // Process next batch after current one completes
                await processBatch(startIndex + BATCH_SIZE);
              } catch (error) {
                console.error("Error in getChunkTimeRange:", error);
              }
            };

            processBatch(0);
          });
      })
      .catch((error) => {
        console.error("Error fetching timeTrackingChunks:", error);
      });
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <AfterInteractions>
          {/* <HabitCard></HabitCard> */}
          <TestComp></TestComp>
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
