import { create } from "zustand";
import { dayPlannerDataGetterHelper } from "./dayPlannerDataGetterHelper";

type DayPlannerChartData = { day: string; completion: number }[];
type TimeRange = { timeRangeStart: number; timeRangeEnd: number };

interface DayPlannerChartDataState {
  isLoadingData: boolean;
  globalDataTimeStart: number | null;
  setGlobalDataTimeStart: (time: number) => void;
  weekViewData: DayPlannerChartData | null;
  weekTimeRange: TimeRange;
  monthViewData: DayPlannerChartData | null;
  monthTimeRange: TimeRange;
  yearViewData: DayPlannerChartData | null;
  yearTimeRange: TimeRange;
  setWeekTimeRange: ({
    timeRangeStart,
    timeRangeEnd,
  }: TimeRange) => Promise<void>;
  setMonthTimeRange: ({
    timeRangeStart,
    timeRangeEnd,
  }: TimeRange) => Promise<void>;
  setYearTimeRange: ({
    timeRangeStart,
    timeRangeEnd,
  }: TimeRange) => Promise<void>;
}

const unixOneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
const unixOneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
const unixOneYearAgo = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;

const useDayPlannerChartDataState = create<DayPlannerChartDataState>(
  (set, get) => {
    return {
      setGlobalDataTimeStart: (time: number) => {
        set({ globalDataTimeStart: time });
      },
      globalDataTimeStart: null,
      isLoadingData: false,
      weekViewData: null,
      weekTimeRange: {
        timeRangeStart: unixOneWeekAgo,
        timeRangeEnd: Date.now(),
      },
      monthViewData: null,
      monthTimeRange: {
        timeRangeStart: unixOneMonthAgo,
        timeRangeEnd: Date.now(),
      },
      yearViewData: null,
      yearTimeRange: {
        timeRangeStart: unixOneYearAgo,
        timeRangeEnd: Date.now(),
      },
      setWeekTimeRange: async ({ timeRangeStart, timeRangeEnd }: TimeRange) => {
        set({ isLoadingData: true });
        const data = await dayPlannerDataGetterHelper({
          timeRangeStart,
          timeRangeEnd,
        });
        set({
          weekViewData: data,
          weekTimeRange: { timeRangeStart, timeRangeEnd },
          isLoadingData: false,
        });
      },
      setMonthTimeRange: async ({
        timeRangeStart,
        timeRangeEnd,
      }: TimeRange) => {
        set({ isLoadingData: true });
        const data = await dayPlannerDataGetterHelper({
          timeRangeStart,
          timeRangeEnd,
        });
        set({
          monthViewData: data,
          monthTimeRange: { timeRangeStart, timeRangeEnd },
          isLoadingData: false,
        });
      },
      setYearTimeRange: async ({ timeRangeStart, timeRangeEnd }: TimeRange) => {
        set({ isLoadingData: true });
        const data = await dayPlannerDataGetterHelper({
          timeRangeStart,
          timeRangeEnd,
        });
        set({
          yearViewData: data,
          yearTimeRange: { timeRangeStart, timeRangeEnd },
          isLoadingData: false,
        });
      },
    };
  },
);

export { useDayPlannerChartDataState };
