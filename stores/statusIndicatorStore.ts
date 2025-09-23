import { create } from "zustand";

interface IStatusIndicatorStore {
  isSavingLocalData: boolean;
  setIsSavingLocalData: (isSaving: boolean) => void;
  isSyncingWithRemoteStorage: boolean;
  setIsSyncingWithRemoteStorage: (isSyncing: boolean) => void;
  isDownloadingFromRemoteStorage: boolean;
  setIsDownloadingFromRemoteStorage: (isDownloading: boolean) => void;
  isUploadingToRemoteStorage: boolean;
  setIsUploadingToRemoteStorage: (isUploading: boolean) => void;
}

const useStatusIndicatorStore = create<IStatusIndicatorStore>((set, get) => ({
  isSavingLocalData: false,
  setIsSavingLocalData: (isSaving: boolean) =>
    set({ isSavingLocalData: isSaving }),
  isSyncingWithRemoteStorage: false,
  setIsSyncingWithRemoteStorage: (isSyncing: boolean) =>
    set({ isSyncingWithRemoteStorage: isSyncing }),
  isDownloadingFromRemoteStorage: false,
  setIsDownloadingFromRemoteStorage: (isDownloading: boolean) =>
    set({ isDownloadingFromRemoteStorage: isDownloading }),
  isUploadingToRemoteStorage: false,
  setIsUploadingToRemoteStorage: (isUploading: boolean) =>
    set({ isUploadingToRemoteStorage: isUploading }),
}));

export { useStatusIndicatorStore };
