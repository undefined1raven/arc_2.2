import { create } from "zustand";

type HabitCardDataType = {
  activityName: string;
  streakData: { date: string; duration: number }[];
}[];

interface HabitCardData {
  derivedData: HabitCardDataType | null;
  hasLoadedData: boolean;
  setHasLoadedData: (hasLoadedData: boolean) => void;
  trackedIds: string[] | null;
  setTrackedIds: (ids: string[] | null) => void;
  hasTrackedIds: boolean;
  setHasTrackedIds: (hasTrackedIds: boolean) => void;
  setDerivedData: (data: HabitCardDataType) => void;
}

const useHabitCardDataApi = create<HabitCardData>((set, get) => ({
  derivedData: null,
  hasLoadedData: false,
  setHasLoadedData: (hasLoadedData) => {
    set({ hasLoadedData });
  },
  hasTrackedIds: false,
  setHasTrackedIds: (hasTrackedIds) => {
    set({ hasTrackedIds });
  },
  trackedIds: null,
  setTrackedIds: (ids) => {
    set({ trackedIds: ids });
  },
  setDerivedData: (data) => {
    set({ derivedData: data });
  },
}));

export { useHabitCardDataApi };
export type { HabitCardDataType };
