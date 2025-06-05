import { SIDGroupType, SIDNoteType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface IDiary {
  notes: SIDNoteType[] | null;
  setNotes: (notes: SIDNoteType[] | null) => void;
  groups: SIDGroupType[] | null;
  setGroups: (groups: SIDGroupType[] | null) => void;
  noteChunkMapping: Record<string, SIDNoteType["noteID"]> | null;
  setNoteChunkMapping: (
    noteChunkMapping: Record<string, SIDNoteType["noteID"]> | null
  ) => void;
}

const useDiaryData = create<IDiary>()((set, get) => ({
  notes: null,
  noteChunkMapping: null,
  setNoteChunkMapping: (
    noteChunkMapping: Record<string, SIDNoteType["noteID"]> | null
  ) => set({ noteChunkMapping }),
  setNotes: (notes: SIDNoteType[] | null) => set({ notes }),
  groups: null,
  setGroups: (groups: SIDGroupType[] | null) => set({ groups }),
}));

export { useDiaryData };
