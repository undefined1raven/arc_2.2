import { TessDayLogType, TessStatusType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DayPlannerStatusToEdit {
  statusToEdit: TessStatusType | null | undefined;
  setStatusToEdit: (status: TessStatusType | null) => void;
}

const useDayPlannerStatusToEdit = create<DayPlannerStatusToEdit>(
  (set, get) => ({
    statusToEdit: undefined,
    setStatusToEdit: (status: TessStatusType | null) => {
      set({ statusToEdit: status });
    },
  })
);

export { useDayPlannerStatusToEdit };
