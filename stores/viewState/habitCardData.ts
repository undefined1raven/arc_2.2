import { processHabitDataFromTimeLogs } from "@/components/utils/dataProcessing/habitDataProcessingFromTimeLogs";
import { ArcTaskLogType } from "@/constants/CommonTypes";
import { create } from "zustand";

type HabitCardDataType = HabitCardDataShape[];

type HabitCardDataShape = {
  activityName: string;
  streakData: { date: string; duration: number }[];
};

interface HabitCardData {
  derivedData: HabitCardDataType | null;
  hasLoadedData: boolean;
  trackedIds: string[] | null;
  setTrackedIds: (ids: string[] | null) => void;
  hasTrackedIds: boolean;
  rawData: ArcTaskLogType[] | null;
  setRawData: (data: ArcTaskLogType[] | null) => void;
}

const useHabitCardDataApi = create<HabitCardData>((set, get) => ({
  rawData: null,
  setRawData: (data) => {
    set({ rawData: data });
  },
  derivedData: null,
  hasLoadedData: false, ///used to track if the derived data has been computed
  hasTrackedIds: false,
  trackedIds: null,
  setTrackedIds: (ids) => {
    set({ hasTrackedIds: true });
    set({ trackedIds: ids });

    const rawData = get().rawData;
    if (
      ids &&
      ids !== null &&
      ids?.length > 0 &&
      rawData &&
      rawData !== null &&
      rawData.length > 0
    ) {
      const newDerivedData = processHabitDataFromTimeLogs(rawData, ids);
      set({ derivedData: newDerivedData, hasLoadedData: true });
    } else {
      set({ trackedIds: [], hasLoadedData: true });
    }
  },
}));

export { useHabitCardDataApi };
export type { HabitCardDataType, HabitCardDataShape };
