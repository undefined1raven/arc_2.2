import { TessDayLogType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DayPlannerActiveDay {
  activeDay: TessDayLogType | null | undefined;
  setActiveDay: (day: TessDayLogType | null) => void;
  recentDays: TessDayLogType[];
  setRecentDays: (days: TessDayLogType[]) => void;
}

const useDayPlannerActiveDay = create<DayPlannerActiveDay>((set, get) => ({
  activeDay: undefined,
  setActiveDay: (day: TessDayLogType | null) => {
    set({ activeDay: day });
  },
  recentDays: [],
  setRecentDays: (days: TessDayLogType[]) => {
    set((state) => ({
      recentDays: [...state.recentDays, ...days],
    }));
  },
}));

export { useDayPlannerActiveDay };
