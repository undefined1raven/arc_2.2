import { SIDNoteType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DiarySelectedNote {
  selectedNote: SIDNoteType | null;
  setSelectedNote: (group: SIDNoteType | null) => void;
}

const useSelectedDiaryNote = create<DiarySelectedNote>((set, get) => ({
  selectedNote: null,
  setSelectedNote: (group: SIDNoteType | null) => {
    set({ selectedNote: group });
  },
}));

export { useSelectedDiaryNote };
