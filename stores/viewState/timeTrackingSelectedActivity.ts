import {
  ARCCategoryType,
  ARCTasksType,
  TessDayLogType,
  TessStatusType,
} from "@/constants/CommonTypes";
import { create } from "zustand";

interface TimeTrackingSelectedActivity {
  activityToEdit: ARCTasksType | null | undefined;
  setActivityToEdit: (status: ARCTasksType | null) => void;
  categoryToEdit: ARCCategoryType | null | undefined;
  setCategoryToEdit: (status: ARCCategoryType | null) => void;
}

const useTimeTrackingSelectedActivity = create<TimeTrackingSelectedActivity>(
  (set, get) => ({
    activityToEdit: undefined,
    categoryToEdit: undefined,
    setActivityToEdit: (status: ARCTasksType | null) => {
      set({ activityToEdit: status });
    },
    setCategoryToEdit: (status: ARCCategoryType | null) => {
      set({ categoryToEdit: status });
    },
  })
);

export { useTimeTrackingSelectedActivity };
