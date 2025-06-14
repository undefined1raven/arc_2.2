import { create } from "zustand";

type HabitCardDataType = {
  activityName: string;
  streakData: { date: string; duration: number }[];
}[];

interface HabitCardData {
  derivedData: HabitCardDataType | null;
  trackedIds: string[] | null;
  setTrackedIds: (ids: string[]) => void;
  setDerivedData: (data: HabitCardDataType) => void;
}

const useHabitCardDataApi = create<HabitCardData>((set, get) => ({
  derivedData: null,
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
