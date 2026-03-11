import { getLocalCache } from "@/components/utils/localDb";
import { ActivityTransitionLog, ArcTaskLogType } from "@/constants/CommonTypes";
import { timestampToDayType } from "@/constants/timestampToDayType";
import { timestampToLocalUtcHour } from "@/constants/timestampToUtcHour";
import { timeToDaySegment } from "@/constants/timeToDaySegment";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import * as SQLite from "expo-sqlite";

///IF the activities transition table is empty, fetch the last 7 days of activities and populate the table with reconstructed transition data
async function retroBehaviorLogs() {
  const db = await getLocalCache();

  const transitionsTableCheck = await db.getAllAsync(
    "SELECT * FROM activityTransitions LIMIT 5;",
  );

  if (transitionsTableCheck.length > 0) {
    console.log("Activity transitions already exist, skipping retro logs");
    return;
  }

  const dataRetrivalAPI = dataRetrivalApi.getState();
  const last2WeeksStart = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const activityDataResponse = await dataRetrivalAPI.getDataInTimeRange(
    "timeTrackingChunks",
    last2WeeksStart,
    null,
    null,
  );

  if (activityDataResponse.status !== "success") {
    console.warn(
      "Failed to retrieve activity data for retroactive behavior logs",
    );
    return;
  }

  const activityData = activityDataResponse.payload as ArcTaskLogType[];

  const transitions: ActivityTransitionLog[] = [];

  for (let ix = 0; ix < activityData.length - 1; ix++) {
    if (ix === 0) {
      continue; //Continue if first since we dont have a previous activity
    }
    const prev = activityData[ix - 1];
    const current = activityData[ix];

    if (current.end === null) {
      continue;
    }

    const transitionHour = timestampToLocalUtcHour(current.end);
    const daySegment = timeToDaySegment(transitionHour);
    const dayType = timestampToDayType(current.end);

    transitions.push({
      previousActivity: prev.taskID,
      nextActivity: current.taskID,
      dayType,
      timeBucket: daySegment,
    });
  }

  const insertPromises = transitions.map((transition) =>
    db.runAsync(
      "INSERT INTO activityTransitions (previousActivity, nextActivity, dayType, timeBucket) VALUES (?, ?, ?, ?)",
      transition.previousActivity,
      transition.nextActivity,
      transition.dayType,
      transition.timeBucket,
    ),
  );

  const response = await Promise.all(insertPromises);
}

export { retroBehaviorLogs };
