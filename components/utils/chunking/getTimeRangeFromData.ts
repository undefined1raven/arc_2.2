function getTimeRangeFromData(
  data: any[],
  tableName: "timeTrackingChunks" | "dayPlannerChunks"
): {
  status: "success" | "error";
  payload?: { start: number | null; end: number | null };
  error?: string;
} {
  if (!data || data.length === 0) {
    return { status: "error", error: "No data provided" };
  }
  if (tableName !== "timeTrackingChunks" && tableName != "dayPlannerChunks") {
    return { status: "error", error: "Invalid table name" };
  }

  let timeRangeStart = null;
  let timeRangeEnd = null;

  if (tableName === "timeTrackingChunks") {
    timeRangeStart = data[0].start;
    timeRangeEnd = data[data.length - 1].end;
  } else if (tableName === "dayPlannerChunks") {
    try {
      function dayToUnixTimestamp(day: string): number {
        const date = new Date(day);
        return date.getTime();
      }
      timeRangeStart = dayToUnixTimestamp(data[0].day);
      timeRangeEnd = dayToUnixTimestamp(data[data.length - 1].day);
    } catch (error) {}
  }

  return {
    status: "success",
    payload: { start: timeRangeStart, end: timeRangeEnd },
  };
}

export { getTimeRangeFromData };
