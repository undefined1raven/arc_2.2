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
  deviceData: {
    deviceId: string;
    public_key: string;
    private_key_backup: string;
  } | null;
  setDeviceData: (deviceData: NewUserData["deviceData"]) => void;
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
  deviceData: null,
  setDeviceData: (deviceData: NewUserData["deviceData"]) => {
    const currentDeviceData = get().deviceData;
    if (currentDeviceData === null) {
      set({ deviceData });
    } else {
      set({ deviceData: { ...currentDeviceData, ...deviceData } });
    }
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
