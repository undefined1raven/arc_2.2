import { dataRetrivalApi } from "@/stores/dataRetriavalApi";

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

  return data;
}

export { dayPlannerDataGetterHelper };
