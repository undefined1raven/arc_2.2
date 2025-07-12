import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

function DayPlannerChart() {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const recentDayPlannerData = useDayPlannerActiveDay((s) => s.recentDays);
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (f) => f.dayPlannerFeatureConfig
  );

  const screenWidth = useWindowDimensions().width;

  const [dataOffset, setDataOffset] = useState(1);
  const [numberOfDaysDisplayed, setNumberOfDaysDisplayed] = useState(7);

  const lineData = useMemo(() => {
    if (recentDayPlannerData) {
      function getLabelDate(day: string) {
        const date = new Date(day);
        return (
          date.getDate() +
          " " +
          date.toLocaleString("default", { month: "short" })
        );
      }

      function getColorFromCompletion(completion: number) {
        const transparency = "90";
        if (completion >= 80) {
          return globalStyle.successColor + transparency;
        } else if (completion >= 25) {
          return globalStyle.warningColor + transparency;
        } else {
          return globalStyle.errorTextColor + transparency;
        }
      }

      const sortedData = recentDayPlannerData.sort((a, b) => {
        return new Date(a.day).getTime() - new Date(b.day).getTime();
      });

      const newData = sortedData.map((item) => {
        const dayCompletion = computeDayPlannerCompletion(
          dayPlannerFeatureConfig,
          item
        );

        const colorFromCompletion = getColorFromCompletion(dayCompletion);

        let additionalFields = {};
        if (numberOfDaysDisplayed <= 7) {
          additionalFields = {
            capThickness: 8,
            capColor: colorFromCompletion,
            topLabelComponent: () => {
              return (
                <Text
                  fontSize={globalStyle.mediumMobileFont}
                  label={`${dayCompletion}%`}
                  style={{
                    width: 50,
                    color: globalStyle.colorAltLight,
                  }}
                ></Text>
              );
            },
          };
        }

        return {
          value: parseInt(dayCompletion),
          label: getLabelDate(item.day),
          frontColor: colorFromCompletion,
          barBorderTopRightRadius: globalStyle.borderRadius,
          barBorderTopLeftRadius: globalStyle.borderRadius,
          labelTextStyle: {
            color: globalStyle.textColorAccent,
            fontSize: 14,
          },
          ...additionalFields,
        };
      });
      return newData.slice(-numberOfDaysDisplayed * dataOffset);
    }

    return [];
  }, [
    recentDayPlannerData,
    dayPlannerFeatureConfig,
    dataOffset,
    numberOfDaysDisplayed,
  ]);

  const buttonStyle = useCallback(() => {
    return {
      width: 80,
      height: 35,
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        height: 500,
        justifyContent: "flex-end",
      }}
    >
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <Button
          borderColor={
            numberOfDaysDisplayed === 30
              ? globalStyle.colorAltLight
              : globalStyle.color + "AA"
          }
          color={
            numberOfDaysDisplayed === 30
              ? globalStyle.colorAltLight
              : globalStyle.color + "AA"
          }
          style={{ ...buttonStyle() }}
          label="1m"
          onClick={() => {
            setNumberOfDaysDisplayed(30);
            setDataOffset(1);
          }}
        ></Button>
        <Button
          borderColor={
            numberOfDaysDisplayed === 7
              ? globalStyle.colorAltLight
              : globalStyle.color + "AA"
          }
          color={
            numberOfDaysDisplayed === 7
              ? globalStyle.colorAltLight
              : globalStyle.color + "AA"
          }
          style={{ ...buttonStyle() }}
          label="1w"
          onClick={() => {
            setNumberOfDaysDisplayed(7);
            setDataOffset(1);
          }}
        ></Button>
      </View>
      <BarChart
        height={500}
        capThickness={3}
        initialSpacing={0}
        data={lineData}
        barWidth={numberOfDaysDisplayed > 7 ? 13 : 30}
        spacing={numberOfDaysDisplayed > 7 ? 5 : screenWidth / 18}
        maxValue={100}
        isAnimated
        rulesColor={globalStyle.color + "30"}
        noOfSections={5}
        hideYAxisText={true}
        xAxisColor={globalStyle.color}
        yAxisIndicesWidth={0}
        cappedBars
        yAxisThickness={0}
        rulesType="dashed"
        showVerticalLines={false}
        verticalLinesColor={globalStyle.colorInactive}
        xAxisLabelsHeight={numberOfDaysDisplayed > 7 ? 0 : undefined}
        color={globalStyle.colorAlt + "AA"}
      />
    </View>
  );
}

export { DayPlannerChart };
