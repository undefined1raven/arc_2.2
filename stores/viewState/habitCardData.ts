import { create } from "zustand";

type HabitCardDataType = {
  activityName: string;
  streakData: { date: string; duration: number }[];
}[];

interface HabitCardData {
  derivedData: HabitCardDataType | null;
  setDerivedData: (data: HabitCardDataType) => void;
}

const useHabitCardDataApi = create<HabitCardData>((set, get) => ({
  derivedData: null,
  setDerivedData: (data) => {
    set({ derivedData: data });
  },
}));

export { useHabitCardDataApi };
export type { HabitCardDataType };
