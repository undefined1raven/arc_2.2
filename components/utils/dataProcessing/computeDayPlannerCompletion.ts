import { TessDayLogType, TessStatusType } from "@/constants/CommonTypes";
import { rangeScaler } from "../RangeScaler";

function computeDayPlannerCompletion(
  dayPlannerFeatureConfig: TessStatusType[],
  day: TessDayLogType
) {
  const tasks = day.tasks;

  if (tasks.length === 0) {
    return 0;
  }

  let completionScore = 0;
  tasks.forEach((task) => {
    const taskStatusID = task.statusID;
    const taskStatus = dayPlannerFeatureConfig.find(
      (status) => status.statusID === taskStatusID
    );
    if (!taskStatus) {
      return;
    }
    const taskCompletionScore = taskStatus.completionEffect;
    completionScore += taskCompletionScore;
  });
  const taskCount = tasks.length;
  const completionPercantage = (
    parseFloat((completionScore / taskCount).toFixed(2)) * 100
  ).toFixed(0);

  return completionPercantage;
}

export { computeDayPlannerCompletion };
