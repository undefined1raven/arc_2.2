import { TessDayLogType, TessStatusType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DayPlannerTaskToEdit {
  taskToEdit: TessDayLogType["tasks"][number] | null | undefined;
  setTaskToEdit: (status: TessDayLogType["tasks"][number] | null) => void;
}

const useDayPlannerTaskToEdit = create<DayPlannerTaskToEdit>((set, get) => ({
  taskToEdit: undefined,
  setTaskToEdit: (status: TessDayLogType["tasks"][number] | null) => {
    set({ taskToEdit: status });
  },
}));

export { useDayPlannerTaskToEdit };
