import { create } from "zustand";

interface IOfflineLoginTempStore {
  pin: string | null;
  passphrase: string | null;
  setPin: (pin: string) => void;
  setPassphrase: (passphrase: string) => void;
}

const keyRegenTempStore = create<IOfflineLoginTempStore>((set, get) => ({
  pin: null,
  passphrase: null,
  setPin: (pin) => set({ pin: pin }),
  setPassphrase: (passphrase) => set({ passphrase: passphrase }),
}));

export { keyRegenTempStore };
