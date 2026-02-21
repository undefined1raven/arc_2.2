import { initialDataSync } from "@/components/utils/api/initialDataSync";
import {
  ArcTaskLogType,
  SIDGroupType,
  TessDayLogType,
} from "@/constants/CommonTypes";
import { useActiveUser } from "@/stores/activeUser";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDiaryData } from "@/stores/diary/diary";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useHabitCardDataApi } from "@/stores/viewState/habitCardData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { retroBehaviorLogs } from "./retroBehaviorLogs";

///Get UI blocking data at login
function getDayPlannerActiveDay() {
  const dataRetriavalAPI = dataRetrivalApi.getState();
  const dayPlannerApi = useDayPlannerActiveDay.getState();
  ///Get the data for the active day. Has priority over recent days.
  dataRetriavalAPI
    .getDataInTimeRange(
      "dayPlannerChunks",
      Date.now() - 24 * 60 * 60 * 1000,
      null,
      1,
    )
    .then((res) => {
      if (res.status === "success") {
        const data = res.payload;
        const currentActiveDay: TessDayLogType = data?.find(
          (day) => day.isActive === true,
        );

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
}

function loadRecentDayPlannerData() {
  const dataRetriavalAPI = dataRetrivalApi.getState();
  const dayPlannerApi = useDayPlannerActiveDay.getState();

  ///Get the recent days data
  const lastMonthStart = new Date();
  lastMonthStart.setDate(lastMonthStart.getDate() - 7);
  lastMonthStart.setHours(0, 0, 0, 0);
  const msInADay = 24 * 60 * 60 * 1000;
  dataRetriavalAPI
    .getDataInTimeRange(
      "dayPlannerChunks",
      lastMonthStart.getTime(),
      Date.now() + msInADay,
      null,
    )
    .then((res) => {
      //@ts-ignore
      let data: TessDayLogType[] = res.payload;
      dayPlannerApi.setHasLoadedInitialData(true);
      dayPlannerApi.setRecentDays(data || []);
    });
}

///Get UI blocking data at login
function loadDiaryGroups() {
  const dataRetrivalAPI = dataRetrivalApi.getState();
  const diaryApi = useDiaryData.getState();
  dataRetrivalAPI
    .getDataInTimeRange("personalDiaryGroups", null, null, null)
    .then((data) => {
      const groups = data.payload as any as SIDGroupType[];
      diaryApi.setGroupsChunkMapping(
        //@ts-ignore
        data.dataChunkMapping ? data.dataChunkMapping : {},
      );
      diaryApi.setGroups(groups);
    })
    .catch((error) => {
      console.error("Error retrieving diary data:", error);
    });
}

function loadLastWeekTimeTrackingData() {
  const dataRetrivalAPI = dataRetrivalApi.getState();
  const habitDataApi = useHabitCardDataApi.getState();
  const timeConstants = {
    aWeekAgo: Date.now() - 7 * 24 * 60 * 60 * 1000,
  };
  const activeUserId = useActiveUser.getState().activeUser?.userId;
  if (!activeUserId) return;
  dataRetrivalAPI
    .getDataInTimeRange(
      "timeTrackingChunks",
      timeConstants.aWeekAgo,
      null,
      null,
    )
    .then(async (data) => {
      const timeTrackingData = data.payload as ArcTaskLogType[];

      habitDataApi.setRawData(timeTrackingData);

      try {
        const data = await AsyncStorage.getItem(
          `${activeUserId}-habitCardData`,
        );
        if (data) {
          const parsedData: string[] = JSON.parse(data);
          const habitDataApi = useHabitCardDataApi.getState();
          habitDataApi.setTrackedIds(parsedData);
        } else {
          habitDataApi.setTrackedIds(null);
        }
      } catch (error) {
        console.error("Error loading habit card data:", error);
      }
    })
    .catch((error) => {
      console.error("Error retrieving time tracking data:", error);
    });
}

///Called once after the user logs in and crypto keys are available
function onLoginOnce() {
  //   initialDataSync();
  getDayPlannerActiveDay();
  loadDiaryGroups();
  loadRecentDayPlannerData();
  loadLastWeekTimeTrackingData();
  retroBehaviorLogs();
}

export { onLoginOnce };
