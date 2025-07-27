import { ArcTaskLogType, ARCTasksType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface ITimeTrackingDataExplorer {
  selectedActivities: ARCTasksType[];
  setSelectedActivities: (activities: ARCTasksType[]) => void;
  dataInTimeRange: ArcTaskLogType[] | null;
  setDataInTimeRange: (data: ArcTaskLogType[] | null) => void;
  isFetchingData: boolean;
  setIsFetchingData: (isFetching: boolean) => void;
  viewState: [];
  setViewState: (viewState: []) => void;
}

const useTimeTrackingDataExplorer = create<ITimeTrackingDataExplorer>(
  (set, get) => ({
    selectedActivities: [],
    setSelectedActivities: (activities: ARCTasksType[]) => {
      set({ selectedActivities: activities });
    },
    dataInTimeRange: null,
    setDataInTimeRange: (data: ArcTaskLogType[] | null) =>
      set({ dataInTimeRange: data }),
    isFetchingData: false,
    setIsFetchingData: (isFetching: boolean) => {
      set({ isFetchingData: isFetching });
    },
    viewState: [],
    setViewState: (viewState: []) => {
      set({ viewState: viewState });
    },
  })
);

export { useTimeTrackingDataExplorer };
