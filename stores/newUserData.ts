////Used during the creation of a new account
import { create } from "zustand";

interface NewUserData {
  newPIN: null | string;
  setNewPIN: (newPIN: string) => void;
  useBiometricAuth: boolean;
  setUseBiometricAuth: (useBiometricAuth: boolean) => void;
  recoveryCodes: string[];
  setRecoveryCodes: (recoveryCodes: string[]) => void;
  secretKey: string | null;
  setSecretKey: (secretKey: string) => void;
  setDevicePublicKey: (devicePublicKey: string) => void;
  devicePublicKey: string | null;
  setUserData: (userData: Partial<NewUserData["userData"]>) => void;
  userData: {
    id: string;
    signupTime: number;
    PIKBackup?: string;
    PSKBackup?: string;
    RCKBackup?: string;
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
  newPIN: null,
  setNewPIN: (newPIN) => {
    set({ newPIN });
  },
  devicePublicKey: null,
  setDevicePublicKey(devicePublicKey) {
    set({ devicePublicKey });
  },
  useBiometricAuth: false,
  setUseBiometricAuth: (useBiometricAuth) => {
    set({ useBiometricAuth });
  },
  secretKey: null,
  setSecretKey(secretKey) {
    set({ secretKey });
  },
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
