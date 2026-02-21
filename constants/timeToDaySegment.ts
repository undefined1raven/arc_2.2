type DaySegment = "morning" | "afternoon" | "evening" | "night";

function timeToDaySegment(utcHour: number): DaySegment {
  if (utcHour >= 6 && utcHour < 11) {
    return "morning";
  }
  if (utcHour >= 11 && utcHour < 17) {
    return "afternoon";
  }
  if (utcHour >= 17 && utcHour < 23) {
    return "evening";
  }
  return "night";
}

export { timeToDaySegment };
export type { DaySegment };
