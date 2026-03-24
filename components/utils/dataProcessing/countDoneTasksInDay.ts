import { TessDayLogType, TessStatusType } from "@/constants/CommonTypes";
import { rangeScaler } from "../RangeScaler";

function countDoneTasksInDay(
  dayPlannerFeatureConfig: TessStatusType[],
  day: TessDayLogType,
): number {
  const tasks = day.tasks;

  if (tasks.length === 0) {
    return 0;
  }

  let completedTasks: number = 0;
  tasks.forEach((task) => {
    const taskStatusID = task.statusID;
    const taskStatus = dayPlannerFeatureConfig.find(
      (status) => status.statusID === taskStatusID,
    );
    if (!taskStatus) {
      return;
    }
    const taskCompletionScore = parseFloat(
      taskStatus.completionEffect.toString(),
    );
    if (taskCompletionScore >= 1) {
      completedTasks++;
    }
  });
  return completedTasks;
}

function countHighPriorityTasksLeftInDay(
  dayPlannerFeatureConfig: TessStatusType[],
  day: TessDayLogType,
) {
  const tasks = day.tasks;

  if (tasks.length === 0) {
    return 0;
  }

  let highPrioTasksLeft: number = 0;
  tasks.forEach((task) => {
    const taskStatusID = task.statusID;
    const taskStatus = dayPlannerFeatureConfig.find(
      (status) => status.statusID === taskStatusID,
    );
    if (!taskStatus) {
      return;
    }
    const taskCompletionScore = parseFloat(
      taskStatus.completionEffect.toString(),
    );
    const taskLabels = task.labels;
    if (
      taskLabels.includes("highPriority") === true &&
      taskCompletionScore < 1
    ) {
      highPrioTasksLeft++;
    }
  });
  return highPrioTasksLeft;
}

export { countDoneTasksInDay, countHighPriorityTasksLeftInDay };
