import { create } from "zustand";

interface ActiveUser {
  hasChecked: boolean;
  isLoggedIn: boolean;
  userId: string | null;
}

interface IActiveUser {
  activeUser: ActiveUser;
  setActiveUser: (user: ActiveUser) => void;
}

const useActiveUser = create<IActiveUser>((set, get) => ({
  activeUser: {
    hasChecked: false,
    isLoggedIn: false,
    userId: null,
  },
  setActiveUser: (user: ActiveUser) => set({ activeUser: user }),
}));

export { useActiveUser };
