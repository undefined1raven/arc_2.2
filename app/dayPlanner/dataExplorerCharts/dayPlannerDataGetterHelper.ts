import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";

async function dayPlannerDataGetterHelper({
  timeRangeStart,
  timeRangeEnd,
}: {
  timeRangeStart: number;
  timeRangeEnd: number;
}) {
  const dataRetrivalAPI = dataRetrivalApi.getState();

  const dataResponse = await dataRetrivalAPI.getDataInTimeRange(
    "dayPlannerChunks",
    timeRangeStart,
    timeRangeEnd,
    null,
  );

  if (dataResponse.status === "error") {
    return null;
  }

  const data = dataResponse.payload;

  const days: string[] = [];
  const currentDate = new Date(timeRangeStart);
  const endDate = new Date(timeRangeEnd);

  while (currentDate <= endDate) {
    days.push(currentDate.toDateString());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dayPlannerFeatureConfig =
    useFeatureConfigs.getState().dayPlannerFeatureConfig;

  const finalData = [];

  for (const day of days) {
    const dayData = data?.find((item) => item.day === day);

    let completion = null;

    if (dayData) {
      completion = computeDayPlannerCompletion(
        dayPlannerFeatureConfig,
        dayData,
      );
    }

    finalData.push({
      ...dayData,
      completion: dayData ? completion : null,
    });
  }

  return finalData;
}

export { dayPlannerDataGetterHelper };
