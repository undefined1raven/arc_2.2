import {
  ArcTaskLogType,
  SIDGroupType,
  SIDNoteType,
  TessDayLogType,
} from "@/constants/CommonTypes";
import { useActiveUser } from "@/stores/activeUser";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDiaryData } from "@/stores/diary/diary";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useHabitCardDataApi } from "@/stores/viewState/habitCardData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { retroBehaviorLogs } from "./retroBehaviorLogs";
import { useTimeStatsData } from "@/stores/viewState/timeStatsData";
import { useTimeTrackingDataExplorer } from "@/stores/viewState/timeTrackingDataExplorer";
import { getLocalCache } from "@/components/utils/localDb";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { OutboxItem, useOutboxStore, CursorRow } from "@/stores/sync/outbox";
import { syncCall } from "../sync/syncCall";

///Get UI blocking data at login
function getDayPlannerActiveDay() {
  const dataRetriavalAPI = dataRetrivalApi.getState();
  const dayPlannerApi = useDayPlannerActiveDay.getState();
  ///Get the data for the active day. Has priority over recent days.
  dataRetriavalAPI
    .getDataInTimeRange(
      "dayPlannerChunks",
      Date.now() - 48 * 60 * 60 * 1000,
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
  const dayPlannerApi = useDayPlannerActiveDay.getState();

  ///Get the recent days data
  const lastMonthStart = new Date();
  lastMonthStart.setDate(lastMonthStart.getDate() - 14);
  lastMonthStart.setHours(0, 0, 0, 0);

  dayPlannerApi.setDataTimeRange([lastMonthStart.getTime(), Date.now()]);
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

  dataRetrivalAPI
    .getDataInTimeRange("personalDiaryChunks", null, null, null)
    .then((data) => {
      const notes = data.payload as any as SIDNoteType[];
      //@ts-ignore
      diaryApi.setNoteChunkMapping(
        data.dataChunkMapping ? data.dataChunkMapping : {},
      );
      diaryApi.setNotes(notes);
    })
    .catch((error) => {
      console.error("Error retrieving diary data:", error);
    });
}

function loadLastWeekTimeTrackingData() {
  ////Dual use fetch for both the habit tracker and initial data load for the time tracking explorer
  const dataRetrivalAPI = dataRetrivalApi.getState();
  const habitDataApi = useHabitCardDataApi.getState();
  const timeConstants = {
    aWeekAgo: Date.now() - 14 * 24 * 60 * 60 * 1000,
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
      const timeTrackingStatsApi = useTimeStatsData.getState();
      const timeTrackingExplorerApi = useTimeTrackingDataExplorer.getState();
      ///Set initial time tracking explorer data
      timeTrackingStatsApi.setDataInTimeRange(timeTrackingData || null);
      timeTrackingExplorerApi.setDataInTimeRange(timeTrackingData || null);

      ///Set raw data for habit
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

async function syncInit() {
  const db = await getLocalCache();

  const accountId = useActiveUser.getState().activeUser.userId;
  const deviceId = (await getCurrentDeviceInfo())?.device_id || null;

  if (deviceId === null) {
    console.error("Failed to init cursor: no valid device id was found");
    return;
  }

  ///Initialize the sync cursor for the current account and device if it doesn't exist
  await db.runAsync(
    `INSERT OR IGNORE INTO syncCursor
     (account_id, device_id, cursor, updated_at)
     VALUES (?, ?, ?, ?)`,
    accountId,
    deviceId,
    0,
    Date.now(),
  );

  // Return the syncCursor row for this account/device if it exists
  const cursorRow: CursorRow | null = await db.getFirstAsync(
    `SELECT * FROM syncCursor WHERE account_id = ? AND device_id = ?`,
    accountId,
    deviceId,
  );
  const syncCursorRow = cursorRow || null;

  const outboxStore = useOutboxStore.getState();
  if (syncCursorRow !== null && typeof syncCursorRow.cursor === "number") {
    outboxStore.setCursor(syncCursorRow.cursor);
  }

  ///Get the current outbox and load it into the outbox store
  const outboxRows = await db.getAllAsync(
    `SELECT * FROM syncOutbox WHERE account_id = ? AND device_id = ?`,
    accountId,
    deviceId,
  );

  outboxStore.setOutbox(outboxRows as OutboxItem[]);

  void syncCall();
}

///Called once after the user logs in and crypto keys are available
async function onLoginOnce() {
  void syncInit();
  void loadRecentDayPlannerData();
  void loadLastWeekTimeTrackingData();
  void getDayPlannerActiveDay();
  // void loadDiaryGroups();
  void retroBehaviorLogs();
}

export { loadDiaryGroups, onLoginOnce };
