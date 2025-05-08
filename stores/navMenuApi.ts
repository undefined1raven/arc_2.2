import { DayPlannerIcon } from "@/components/deco/DayPlannerIcon";
import { HomeIcon } from "@/components/deco/HomeIcon";
import { PersonalDiaryIcon } from "@/components/deco/PersonalDiaryIcon";
import { SettingdIcon } from "@/components/deco/SettingsIcon";
import { TimeStatsIcon } from "@/components/deco/TimeStatsIcon";
import { create } from "zustand";

type MenuItem = {
  goTo: string;
  icon: any;
  name: string;
};

interface INavMenuApi {
  menuItems: MenuItem[];
  showMenu: boolean;
  setMenuItems: (items: MenuItem[]) => void;
  setShowMenu: (show: boolean) => void;
}

const useNavMenuApi = create<INavMenuApi>((set, get) => ({
  menuItems: [
    { goTo: "settings", icon: SettingdIcon, name: "settings" },
    { goTo: "dayPlanner", icon: DayPlannerIcon, name: "dayPlanner" },
    { goTo: "home", icon: HomeIcon, name: "home" },
    {
      goTo: "timeTracking",
      icon: TimeStatsIcon,
      name: "timeTracking",
    },
    {
      goTo: "personalDiary",
      icon: PersonalDiaryIcon,
      name: "personalDiary",
    },
  ],
  showMenu: true,
  setMenuItems: (items) => set({ menuItems: items }),
  setShowMenu: (show) => set({ showMenu: show }),
}));

export { useNavMenuApi };
