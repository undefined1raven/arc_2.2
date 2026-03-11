import { TessDayLogType, TessStatusType } from "@/constants/CommonTypes";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";

function dayPlannerTaskStatusColorRetrieval(
  task: TessDayLogType["tasks"][number],
) {
  const dayPlannerFeatureConfig =
    useFeatureConfigs.getState().dayPlannerFeatureConfig;
  const globalStyle = useGlobalStyleStore.getState().globalStyle;

  function returnDefaultColors() {
    return {
      color: globalStyle.color,
      textColor: globalStyle.textColor,
    };
  }

  const statusId = task.statusID;
  const status = dayPlannerFeatureConfig.find(
    (status: TessStatusType) => status.statusID === statusId,
  );
  if (status) {
    const statusColors = status.colors;
    if (statusColors === "default") {
      return returnDefaultColors();
    } else {
      const schemeColors = statusColors[globalStyle.colorScheme];
      if (!schemeColors) {
        return returnDefaultColors();
      }
      const themeColors = schemeColors[globalStyle.theme];
      if (!themeColors) {
        return returnDefaultColors();
      }
      return {
        color: themeColors.color,
        textColor: themeColors.textColor,
      };
    }
  } else {
    return returnDefaultColors();
  }
}

export { dayPlannerTaskStatusColorRetrieval };
