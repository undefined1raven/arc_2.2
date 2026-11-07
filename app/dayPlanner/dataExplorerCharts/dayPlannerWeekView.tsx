import Text from "@/components/common/Text";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useDayPlannerChartDataState } from "./dayPlannerChartData";
import { getColorFromDayCompletion } from "@/components/utils/dataProcessing/getColorFromDayCompletion";

function DayPlannerWeekView() {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  const weekData = useDayPlannerChartDataState((s) => s.weekViewData);
  const timeRange = useDayPlannerChartDataState((s) => s.weekTimeRange);
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (f) => f.dayPlannerFeatureConfig,
  );

  const screenWidth = useWindowDimensions().width;
  const screenHeight = useWindowDimensions().height;

  const [parentHeight, setParentHeight] = useState(screenHeight * 0.5);

  const lineData = useMemo(() => {
    if (!timeRange) return [];

    function getLabelDate(day: string) {
      const date = new Date(day);
      return (
        date.getDate() +
        " " +
        date.toLocaleString("default", { month: "short" })
      );
    }

    if (weekData === null) {
      return;
    }

    return weekData.map((dayData) => {
      const dayCompletion = dayData.completion;
      const colorFromCompletion = getColorFromDayCompletion(dayCompletion);

      return {
        value: Number(dayCompletion ?? 0),
        label: getLabelDate(dayData.day),
        frontColor: colorFromCompletion.color,
        barBorderTopRightRadius: globalStyle.borderRadius,
        barBorderTopLeftRadius: globalStyle.borderRadius,
        key: dayData.day,
        labelTextStyle: {
          color: colorFromCompletion.textColor,
          fontSize: 14,
        },
        capThickness: 0,
        capColor: colorFromCompletion.alt,
        topLabelComponent: () => (
          <Text
            fontSize={globalStyle.smallMobileFont}
            label={`${dayCompletion === null ? "No data" : dayCompletion + "%"}`}
            style={{
              width: 50,
              color: colorFromCompletion.textColor,
            }}
          />
        ),
      };
    });
  }, [timeRange, weekData, dayPlannerFeatureConfig, globalStyle]);

  return (
    <View
      style={{
        flexGrow: 1,
        width: "50%",
        display: "flex",
        gap: 5,
        justifyContent: "flex-end",
        alignItems: "center",
        marginRight: 10,
        marginLeft: 10,
        position: "relative",
        left: 16,
      }}
      onLayout={(event) => {
        if (event.nativeEvent.layout.height < 50) {
          setParentHeight(event.nativeEvent.layout.height);
        }
      }}
    >
      <BarChart
        patternId="DiagonalLines"
        capThickness={3}
        height={parentHeight}
        initialSpacing={(screenWidth - 240) / 7}
        data={lineData}
        barWidth={30}
        spacing={(screenWidth - 240) / 7}
        maxValue={100}
        rulesColor={globalStyle.foregroundContrastColor + "50"}
        hideYAxisText={true}
        key={JSON.stringify(timeRange)}
        xAxisColor={globalStyle.color}
        yAxisIndicesWidth={0}
        cappedBars
        yAxisThickness={0}
        rulesType="dashed"
        showVerticalLines={false}
        verticalLinesColor={globalStyle.colorInactive}
        color={globalStyle.colorAlt + "AA"}
      />
    </View>
  );
}

export { DayPlannerWeekView };
