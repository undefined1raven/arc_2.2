import {
  ARCTasksType,
  TessDayLogType,
  TessStatusType,
} from "@/constants/CommonTypes";
import { create } from "zustand";

interface TimeTrackingSelectedActivity {
  activityToEdit: ARCTasksType | null | undefined;
  setActivityToEdit: (status: ARCTasksType | null) => void;
}

const useTimeTrackingSelectedActivity = create<TimeTrackingSelectedActivity>(
  (set, get) => ({
    activityToEdit: undefined,
    setActivityToEdit: (status: ARCTasksType | null) => {
      set({ activityToEdit: status });
    },
  })
);

export { useTimeTrackingSelectedActivity };
