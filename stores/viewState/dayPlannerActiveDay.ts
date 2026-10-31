import { TessDayLogType } from "@/constants/CommonTypes";
import { create } from "zustand";
import { dataRetrivalApi } from "../dataRetriavalApi";
import { getDaysInRange } from "@/components/utils/time/unixTimeRangwToDaysArray";

interface DayPlannerActiveDay {
  activeDay: TessDayLogType | null | undefined;
  historicDayView: TessDayLogType | null | undefined;
  setHistoricDayView: (day: TessDayLogType | null) => void;
  setActiveDay: (day: TessDayLogType | null) => void;
  recentDays: TessDayLogType[];
  setRecentDays: (days: TessDayLogType[]) => void;
  hasLoadedInitialData: boolean;
  setHasLoadedInitialData: (status: boolean) => void;
  dataTimeRange: number[];
  setDataTimeRange: (newTimeRange: number[]) => void;
}

const TwoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

const useDayPlannerActiveDay = create<DayPlannerActiveDay>((set, get) => ({
  dataTimeRange: [TwoWeeksAgo, Date.now()],
  setRecentDays: (days) => {
    set({ recentDays: days });
  },
  setDataTimeRange: async (newTimeRange: number[]) => {
    const dataRetrievalApi = dataRetrivalApi.getState();
    const dataInTimeRangeRes = await dataRetrievalApi.getDataInTimeRange(
      "dayPlannerChunks",
      newTimeRange[0],
      newTimeRange[1],
      null,
    );

    if (dataInTimeRangeRes.status === "error") {
      console.error(
        "Failed to fetch day planner data in specified time range",
        newTimeRange,
      );
      throw new Error(
        "Failed to fetch day planner data in specified time range",
      );
    }

    const dataInTimeRange: TessDayLogType[] =
      dataInTimeRangeRes.payload as TessDayLogType[];

    ///All days in the specified time range in the Sun Oct 25 2026 format even if we dont have any data for that day
    const allDaysInRange = getDaysInRange(newTimeRange[0], newTimeRange[1]);

    const outputDays: TessDayLogType[] = [];

    if (dataInTimeRange?.length === 0) {
      for (let ix = 0; ix < allDaysInRange.length; ix++) {
        outputDays.push({ day: allDaysInRange[ix], tasks: [] });
      }
    } else {
      for (let ix = 0; ix < allDaysInRange.length; ix++) {
        const day = allDaysInRange[ix];
        const dayData = dataInTimeRange.find((d) => d.day === day);
        if (dayData) {
          outputDays.push(dayData);
        } else {
          outputDays.push({ day, tasks: [] });
        }
      }
    }
    set({ hasLoadedInitialData: true });
    set({ dataTimeRange: newTimeRange });
    set({ recentDays: outputDays.reverse() });
  },
  activeDay: undefined,
  setActiveDay: (day: TessDayLogType | null) => {
    set({ activeDay: day });
  },
  hasLoadedInitialData: false,
  setHasLoadedInitialData: (status: boolean) => {
    set({ hasLoadedInitialData: status });
  },
  historicDayView: null,
  setHistoricDayView(day) {
    set({ historicDayView: day });
  },
  recentDays: [],
}));

export { useDayPlannerActiveDay };
