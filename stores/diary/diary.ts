import { SIDGroupType, SIDNoteType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface IDiary {
  notes: SIDNoteType[] | null;
  setNotes: (notes: SIDNoteType[] | null) => void;
  groups: SIDGroupType[] | null;
  setGroups: (groups: SIDGroupType[] | null) => void;
  noteChunkMapping: Record<string, SIDNoteType["noteID"]> | null;
  groupChunkMapping: Record<string, SIDGroupType["groupID"]> | null;
  setGroupsChunkMapping: (
    groupChunkMapping: Record<string, SIDGroupType["groupID"]> | null
  ) => void;
  setNoteChunkMapping: (
    noteChunkMapping: Record<string, SIDNoteType["noteID"]> | null
  ) => void;
}

const useDiaryData = create<IDiary>()((set, get) => ({
  groupChunkMapping: null,
  setGroupsChunkMapping: (
    groupChunkMapping: Record<string, SIDGroupType["groupID"]> | null
  ) => set({ groupChunkMapping }),
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
