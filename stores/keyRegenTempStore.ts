import { create } from "zustand";

interface IOfflineLoginTempStore {
  pin: string | null;
  setPin: (pin: string) => void;
  newRCK: string | null;
  setNewRCK: (newRCK: string) => void;
  plainRecoveryCodes: string[] | null;
  setPlainRecoveryCodes: (plainRecoveryCodes: string[]) => void;
  newPassphrase: string | null;
  setNewPassphrase: (newPassphrase: string) => void;
}

const keyRegenTempStore = create<IOfflineLoginTempStore>((set, get) => ({
  pin: null,
  plainRecoveryCodes: null,
  setPlainRecoveryCodes: (plainRecoveryCodes) =>
    set({ plainRecoveryCodes: plainRecoveryCodes }),
  newPassphrase: null,
  setNewPassphrase: (newPassphrase) => set({ newPassphrase: newPassphrase }),
  newRCK: null,
  setNewRCK: (newRCK) => set({ newRCK: newRCK }),
  setPin: (pin) => set({ pin: pin }),
}));

export { keyRegenTempStore };
