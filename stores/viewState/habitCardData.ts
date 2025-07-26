import { create } from "zustand";

type HabitCardDataType = {
  activityName: string;
  streakData: { date: string; duration: number }[];
}[];

interface HabitCardData {
  derivedData: HabitCardDataType | null;
  trackedIds: string[] | null;
  setTrackedIds: (ids: string[]) => void;
  hasTrackedIds: boolean;
  setHasTrackedIds: (hasTrackedIds: boolean) => void;
  setDerivedData: (data: HabitCardDataType) => void;
}

const useHabitCardDataApi = create<HabitCardData>((set, get) => ({
  derivedData: null,
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
