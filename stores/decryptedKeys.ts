import { create } from "zustand";

interface IKeys {
  activeSymmetricKey: string | null;
  activePrivateKey: string | null;
  setActiveSymmetricKey: (key: string) => void;
  setActivePrivateKey: (key: string) => void;
}

////Store the decrypted keys in memory so theyd get automatically cleared when the user would close the app or when it would get suspended by the OS
const useActiveKeys = create<IKeys>((set, get) => ({
  activePrivateKey: null,
  activeSymmetricKey: null,
  setActiveSymmetricKey: (key) => {
    set({ activeSymmetricKey: key });
  },
  setActivePrivateKey: (key) => {
    set({ activePrivateKey: key });
  },
}));

export { useActiveKeys };
