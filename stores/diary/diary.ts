import {
  SIDGroupType,
  SIDNoteType,
  TessDayLogType,
} from "@/constants/CommonTypes";
import { create } from "zustand";

interface IDiary {
  notes: SIDNoteType[] | null;
  setNotes: (notes: SIDNoteType[] | null) => void;
  groups: SIDGroupType[] | null;
  setGroups: (groups: SIDGroupType[] | null) => void;
}

const useDiaryData = create<IDiary>()((set, get) => ({
  notes: null,
  setNotes: (notes: SIDNoteType[] | null) => set({ notes }),
  groups: null,
  setGroups: (groups: SIDGroupType[] | null) => set({ groups }),
}));

export { useDiaryData };
