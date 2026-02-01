import { ArcTaskLogType } from "@/constants/CommonTypes";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import {
  HabitCardDataType,
  useHabitCardDataApi,
} from "@/stores/viewState/habitCardData";
import { getDateFromTimestamp } from "../time/getDateFromTimestamp";

function processHabitDataFromTimeLogs(
  timeLogs: ArcTaskLogType[],
  trackedIds: string[],
): HabitCardDataType {
  const habitData: HabitCardDataType = [];
  const timeTrackingFC = useFeatureConfigs.getState().timeTrackingFeatureConfig;
  const taskMap = new Map();
  timeTrackingFC.forEach((task) => {
    taskMap.set(task.itme.taskID, task);
  });

  const timeConstants = {
    aWeekAgo: Date.now() - 7 * 24 * 60 * 60 * 1000,
  };

  // Filter and sort data once
  const filteredData = timeLogs
    .filter(
      (t: any) =>
        t.start > timeConstants.aWeekAgo && trackedIds.includes(t.taskID),
    )
    .sort((a: any, b: any) => a.start - b.start);

  // Process data more efficiently
  const habitMap = new Map();

  for (const item of filteredData) {
    const task = taskMap.get(item.taskID);
    if (!task) continue;

    const activityName = task.itme.name;
    const activityDuration = Math.floor((item.end - item.start) / 1000);
    const activityDate = getDateFromTimestamp(item.start);

    if (!habitMap.has(activityName)) {
      habitMap.set(activityName, new Map());
    }

    const streakMap = habitMap.get(activityName);
    const currentDuration = streakMap.get(activityDate) || 0;
    streakMap.set(activityDate, currentDuration + activityDuration);
  }

  // Add empty habits for tracked IDs without data
  for (const taskId of trackedIds) {
    const task = taskMap.get(taskId);
    if (task && !habitMap.has(task.itme.name)) {
      habitMap.set(task.itme.name, new Map());
    }
  }

  // Convert to final format and fill blank days
  const startDate = new Date(timeConstants.aWeekAgo);
  const endDate = new Date();

  for (const [activityName, streakMap] of habitMap) {
    const streakData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      const duration = streakMap.get(dateString) || 0;
      streakData.push({ date: dateString, duration });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    habitData.push({ activityName, streakData });
  }

  const excludingTodayData = habitData.map((habit) => {
    return {
      activityName: habit.activityName,
      streakData: habit.streakData.filter((data) => {
        return data.date !== getDateFromTimestamp(Date.now());
      }),
    };
  });

  return excludingTodayData;
}

export { processHabitDataFromTimeLogs };
