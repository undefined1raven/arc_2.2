import { FeatureConfigSIDType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface DiaryStatusToEdit {
  statusToEdit: FeatureConfigSIDType[number] | null | undefined;
  setStatusToEdit: (status: FeatureConfigSIDType[number] | null) => void;
}

const useDiaryStatusToEdit = create<DiaryStatusToEdit>((set, get) => ({
  statusToEdit: undefined,
  setStatusToEdit: (status: FeatureConfigSIDType[number] | null) => {
    set({ statusToEdit: status });
  },
}));

export { useDiaryStatusToEdit };
