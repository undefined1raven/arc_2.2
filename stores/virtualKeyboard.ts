import { create } from "zustand";

interface VirtualKeyboard {
  isVisible: boolean;
  setVisible: (isVisible: boolean) => void;
  keyboardHeight: number;
  setKeyboardHeight: (height: number) => void;
  setScreenWithoutKeyboard: (height: number) => void;
  screenWithoutKeyboard: number;
}

const useVirtualKeyboard = create<VirtualKeyboard>((set, get) => ({
  isVisible: false,
  keyboardHeight: 0,
  setKeyboardHeight: (height) => {
    set({ keyboardHeight: height });
  },
  setVisible: (isVisible) => {
    set({ isVisible });
  },
  setScreenWithoutKeyboard: (height) => {
    set({ screenWithoutKeyboard: height });
  },
  screenWithoutKeyboard: 0,
}));

export { useVirtualKeyboard };
