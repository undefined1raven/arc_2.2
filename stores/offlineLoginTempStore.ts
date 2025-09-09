import { DayPlannerIcon } from "@/components/deco/DayPlannerIcon";
import { HomeIcon } from "@/components/deco/HomeIcon";
import { PersonalDiaryIcon } from "@/components/deco/PersonalDiaryIcon";
import { SettingdIcon } from "@/components/deco/SettingsIcon";
import { TimeStatsIcon } from "@/components/deco/TimeStatsIcon";
import { create } from "zustand";

interface IOfflineLoginTempStore {
  pin: string | null;
  passphrase: string | null;
  setPin: (pin: string) => void;
  setPassphrase: (passphrase: string) => void;
}

const useOfflineLoginTempStore = create<IOfflineLoginTempStore>((set, get) => ({
  pin: null,
  passphrase: null,
  setPin: (pin) => set({ pin: pin }),
  setPassphrase: (passphrase) => set({ passphrase: passphrase }),
}));

export { useOfflineLoginTempStore };
