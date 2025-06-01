import { SIDGroupType, TessDayLogType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DiarySelectedGroup {
  selectedGroup: SIDGroupType | null;
  setSelectedGroup: (group: SIDGroupType | null) => void;
}

const useSelectedDiaryGroup = create<DiarySelectedGroup>((set, get) => ({
  selectedGroup: null,
  setSelectedGroup: (group: SIDGroupType | null) => {
    set({ selectedGroup: group });
  },
}));

export { useSelectedDiaryGroup };
