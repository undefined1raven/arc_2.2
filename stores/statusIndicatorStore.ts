import { create } from "zustand";

interface IStatusIndicatorStore {
  isSavingLocalData: boolean;
  setIsSavingLocalData: (isSaving: boolean) => void;
}

const useStatusIndicatorStore = create<IStatusIndicatorStore>((set, get) => ({
  isSavingLocalData: false,
  setIsSavingLocalData: (isSaving: boolean) =>
    set({ isSavingLocalData: isSaving }),
}));

export { useStatusIndicatorStore };
