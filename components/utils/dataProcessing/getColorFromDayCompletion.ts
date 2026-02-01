import { useGlobalStyleStore } from "@/stores/globalStyles";

function getColorFromDayCompletion(dayCompletionPercentage: number): {
  textColor: string;
  color: string;
} {
  const globalStyle = useGlobalStyleStore.getState().globalStyle;
  if (dayCompletionPercentage < 25) {
    return {
      textColor: globalStyle.errorTextColor,
      color: globalStyle.errorColor,
    };
  } else if (dayCompletionPercentage < 75) {
    return {
      textColor: globalStyle.warningTextColor,
      color: globalStyle.warningColor,
    };
  } else {
    return {
      textColor: globalStyle.successTextColor,
      color: globalStyle.successColor,
    };
  }
}

export { getColorFromDayCompletion };
