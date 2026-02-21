import { TessDayLogType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DayPlannerActiveDay {
  activeDay: TessDayLogType | null | undefined;
  historicDayView: TessDayLogType | null | undefined;
  setHistoricDayView: (day: TessDayLogType | null) => void;
  setActiveDay: (day: TessDayLogType | null) => void;
  recentDays: TessDayLogType[];
  setRecentDays: (days: TessDayLogType[]) => void;
  hasLoadedInitialData: boolean;
  setHasLoadedInitialData: (status: boolean) => void;
}

const useDayPlannerActiveDay = create<DayPlannerActiveDay>((set, get) => ({
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
  setRecentDays: (days: TessDayLogType[]) => {
    set((state) => ({
      recentDays: [...state.recentDays, ...days],
    }));
  },
}));

export { useDayPlannerActiveDay };
