import { DayType } from "./CommonTypes";

function timestampToDayType(timestamp: number): DayType {
  const date = new Date(timestamp);
  const day = date.getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

export { timestampToDayType };
