import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { TessDayLogType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { DayPlannerCard } from "./DayPlannerCard";

function dayPlanner() {
  const dataRetriavalAPI = dataRetrivalApi();
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (store) => store.activeDay
  );

  const temporaryFixFn = useCallback((recentDays: TessDayLogType[]) => {
    const dataRetriavalAPI = dataRetrivalApi.getState();
    const activeDays = recentDays.filter((day) => day.isActive === true);
    activeDays.pop();

    const promises = [];

    for (let ix = 0; ix < activeDays.length; ix++) {
      const day = activeDays[ix];
      const endedDay: TessDayLogType = { ...day };
      delete endedDay.isActive;
      promises.push(
        dataRetriavalAPI.modifyEntry(
          "dayPlannerChunks",
          ["day"],
          endedDay.day,
          endedDay,
          undefined,
          "replace"
        )
      );
    }

    Promise.allSettled(promises)
      .then((results) => {
        const successfulUpdates = results.filter(
          (result) => result.status === "fulfilled"
        );
        if (successfulUpdates.length > 0) {
          console.log(
            `Successfully updated ${successfulUpdates.length} active days.`
          );
        } else {
          console.log("No active days were updated.");
        }
      })
      .catch((error) => {
        console.error("Error updating active days:", error);
      });
  }, []);

  useEffect(() => {
    if (dayPlannerActiveDay !== undefined) {
      return;
    }
    dataRetriavalAPI
      .getDataInTimeRange("dayPlannerChunks", undefined, undefined, 1)
      .then((res) => {
        const dayPlannerApi = useDayPlannerActiveDay.getState();
        if (res.status === "success") {
          const data = res.payload;
          const currentActiveDay: TessDayLogType = data?.find(
            (day) => day.isActive === true
          );

          //@ts-ignore
          dayPlannerApi.setRecentDays(data);
          ///TEMP FIX
          temporaryFixFn(data);
          ///TEMP FIX
          if (currentActiveDay) {
            console.log("Active day found", currentActiveDay.day);
            dayPlannerApi.setActiveDay(currentActiveDay);
          } else {
            dayPlannerApi.setActiveDay(null);
            console.log("No active day found");
          }
        }
      })
      .catch((err) => {});
  }, [dayPlannerActiveDay]);

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
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
