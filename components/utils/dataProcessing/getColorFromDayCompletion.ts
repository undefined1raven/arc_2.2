import { useGlobalStyleStore } from "@/stores/globalStyles";

function getColorFromDayCompletion(dayCompletionPercentage: number | null): {
  textColor: string;
  color: string;
  alt: string;
} {
  const globalStyle = useGlobalStyleStore.getState().globalStyle;

  if (dayCompletionPercentage === null) {
    return {
      textColor: globalStyle.textColorAccent,
      color: globalStyle.colorInactive,
      alt: globalStyle.colorInactive,
    };
  }

  if (dayCompletionPercentage < 25) {
    return {
      textColor: globalStyle.errorTextColor,
      color: globalStyle.errorColor,
      alt: globalStyle.errorTextColorAlt,
    };
  } else if (dayCompletionPercentage < 75) {
    return {
      textColor: globalStyle.warningTextColor,
      color: globalStyle.warningColor,
      alt: globalStyle.warningTextColorAlt,
    };
  } else {
    return {
      textColor: globalStyle.successTextColor,
      color: globalStyle.successColor,
      alt: globalStyle.successTextColorAlt,
    };
  }
}

export { getColorFromDayCompletion };
