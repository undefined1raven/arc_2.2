import themeColors, { AvailableThemes } from "@/constants/colors";
import { ColorValueHex } from "@/constants/CommonTypes";
import { create } from "zustand";

interface GlobalStyleType {
  borderRadius: number;
  borderRadius20: number;
  borderRadius10: number;
  largeDesktopFont: number;
  veryLargeDesktopFont: number;
  verySmallDesktopFont: number;
  titleDesktopFont: number;
  regularDesktopFont: number;
  colorAlt: ColorValueHex;
  smallDesktopFont: number;
  mediumDesktopFont: number;
  footnoteDesktopFont: number;
  veryLargeMobileFont: number;
  largeMobileFont: number;
  regularMobileFont: number;
  mediumMobileFont: number;
  smallMobileFont: number;
  footnoteMobileFont: number;
  theme: "light" | "dark";
  androidRippleColor: ColorValueHex;
  statusBarColor: ColorValueHex;
  pageBackgroundColors: ColorValueHex[];
  color: ColorValueHex;
  colorAccent: ColorValueHex;
  textColor: ColorValueHex;
  textColorAccent: ColorValueHex;
  textColorInactive: ColorValueHex;
  colorInactive: ColorValueHex;
  successColor: ColorValueHex;
  successTextColor: ColorValueHex;
  errorColor: ColorValueHex;
  errorTextColor: ColorValueHex;
  colorScheme: AvailableThemes;
  colorAltLight: ColorValueHex;
  warningColor: ColorValueHex;
  warningTextColor: ColorValueHex;
}

interface GlobalStyleStore {
  globalStyle: GlobalStyleType;
  updateGlobalStyle: (newStyles: Partial<GlobalStyleType>) => void;
}

const useGlobalStyleStore = create<GlobalStyleStore>((set) => ({
  globalStyle: {
    borderRadius: 5,
    borderRadius20: 20,
    borderRadius10: 10,
    largeDesktopFont: 27,
    veryLargeDesktopFont: 30,
    verySmallDesktopFont: 15,
    titleDesktopFont: 60,
    regularDesktopFont: 25,
    smallDesktopFont: 12,
    mediumDesktopFont: 21,
    footnoteDesktopFont: 12,
    veryLargeMobileFont: 31,
    largeMobileFont: 19,
    regularMobileFont: 16,
    mediumMobileFont: 14,
    smallMobileFont: 10,
    footnoteMobileFont: 8,
    theme: "light",
    colorScheme: "cloudy",
    ...themeColors["cloudy"]["light"],
  },
  updateGlobalStyle: (newStyles: object) => {
    set((state) => {
      return { globalStyle: { ...state.globalStyle, ...newStyles } };
    });
  },
}));

export { useGlobalStyleStore };
