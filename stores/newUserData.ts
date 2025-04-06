////Used during the creation of a new account
import { create } from "zustand";

interface NewUserData {
  recoveryCodes: string[];
  setRecoveryCodes: (recoveryCodes: string[]) => void;
  setUserData: (userData: Partial<NewUserData["userData"]>) => void;
  userData: {
    id: string;
    signupTime: number;
    publicKey: string;
    passwordHash?: string;
    emailAddress?: string;
    passkeys?: string;
    PIKBackup?: string;
    PSKBackup?: string;
    RCKBackup?: string;
    trustedDevices?: string;
    oauthState?: string;
    securityLogs?: string;
    timeTrackingFeatureConfig: string;
    diaryFeatureConfig: string;
    dayPlannerFeatureConfig: string;
    version: string;
  } | null;
  updateUserData: (newUserData: Partial<NewUserData["userData"]>) => void;
  isGeneratingKeysAndConfig: boolean;
  setGeneratingKeysAndConfig: (isGeneratingKeysAndConfig: boolean) => void;
}

const useNewUserData = create<NewUserData>((set, get) => ({
  userData: null,
  recoveryCodes: [],
  setRecoveryCodes: (recoveryCodes) => {
    set({ recoveryCodes });
  },
  isGeneratingKeysAndConfig: true,
  setGeneratingKeysAndConfig: (isGeneratingKeysAndConfig) => {
    set({ isGeneratingKeysAndConfig });
  },
  setUserData: (userData) => {
    set({ userData: userData });
  },
  updateUserData: (newUserData) => {
    const currentUserData = get().userData;
    if (currentUserData !== null) {
      set({
        userData: {
          ...currentUserData,
          ...newUserData,
        },
      });
    } else {
      set({
        //@ts-ignore
        userData: {
          ...newUserData,
        },
      });
    }
  },
}));

export { useNewUserData };
