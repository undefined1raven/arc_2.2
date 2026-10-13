import { create } from "zustand";

interface IKeys {
  activeSymmetricKey: string | null;
  activeDevicePrivateKey: string | null;
  setActiveSymmetricKey: (key: string) => void;
  setActiveDevicePrivateKey: (key: string) => void;
}

////Store the decrypted keys in memory so theyd get automatically cleared when the user would close the app or when it would get suspended by the OS
const useActiveKeys = create<IKeys>((set, get) => ({
  activeDevicePrivateKey: null,
  activeSymmetricKey: null,
  setActiveSymmetricKey: (key) => {
    set({ activeSymmetricKey: key });
  },
  setActiveDevicePrivateKey: (key) => {
    set({ activeDevicePrivateKey: key });
  },
}));

export { useActiveKeys };
