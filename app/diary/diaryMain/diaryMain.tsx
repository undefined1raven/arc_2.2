import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { useEffect, useState } from "react";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDiaryData } from "@/stores/diary/diary";
import { SIDNoteType } from "@/constants/CommonTypes";
function DiaryMain() {
  const navMenuApi = useNavMenuApi();
  const diaryApi = useDiaryData();
  const [c, sc] = useState("#0000ff");
  useEffect(() => {
    dataRetrivalApi
      .getState()
      .getDataInTimeRange(
        "personalDiaryChunks",
        new Date(0).getTime(),
        Date.now(),
        null
      )
      .then((data) => {
        const notes = data.payload as any as SIDNoteType[];
        diaryApi.setNotes(notes);
      })
      .catch((error) => {
        console.error("Error retrieving diary data:", error);
      });

    return () => {
      // Cleanup if necessary
      diaryApi.setNotes(null);
    };
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <ActivityIndicator size="large" color={c} />
      </ThemedView>
    </>
  );
}
export default DiaryMain;

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
