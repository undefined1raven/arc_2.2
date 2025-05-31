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
  pathname: string;
};

interface INavMenuApi {
  menuItems: MenuItem[];
  showMenu: boolean;
  setMenuItems: (items: MenuItem[]) => void;
  setShowMenu: (show: boolean) => void;
}

const useNavMenuApi = create<INavMenuApi>((set, get) => ({
  menuItems: [
    {
      goTo: "settings",
      icon: SettingdIcon,
      name: "settings",
      pathname: "/settings/settings",
    },
    {
      goTo: "dayPlanner",
      icon: DayPlannerIcon,
      name: "dayPlanner",
      pathname: "/dayPlanner/dayPlanner",
    },
    { goTo: "home", icon: HomeIcon, name: "home", pathname: "/home/home" },
    {
      goTo: "timeTracking",
      icon: TimeStatsIcon,
      name: "timeTracking",
      pathname: "/timeTrackingStats/statsHome/statsHome",
    },
    {
      goTo: "personalDiary",
      icon: PersonalDiaryIcon,
      name: "personalDiary",
      pathname: "/diary/diaryMain/diaryMain",
    },
  ],
  showMenu: true,
  setMenuItems: (items) => set({ menuItems: items }),
  setShowMenu: (show) => set({ showMenu: show }),
}));

export { useNavMenuApi };
