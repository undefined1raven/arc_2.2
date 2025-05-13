import { TessDayLogType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DayPlannerActiveDay {
  activeDay: TessDayLogType | null | undefined;
  setActiveDay: (day: TessDayLogType | null) => void;
}

const useDayPlannerActiveDay = create<DayPlannerActiveDay>((set, get) => ({
  activeDay: undefined,
  setActiveDay: (day: TessDayLogType | null) => {
    set({ activeDay: day });
  },
}));

export { useDayPlannerActiveDay };
