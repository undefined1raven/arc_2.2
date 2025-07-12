import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { computeDayPlannerCompletion } from "@/components/utils/dataProcessing/computeDayPlannerCompletion";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
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
  const screenHeight = useWindowDimensions().height;

  const [dataOffset, setDataOffset] = useState(1);
  const [numberOfDaysDisplayed, setNumberOfDaysDisplayed] = useState(7);
  const [timeRangeLabel, setTimeRangeLabel] = useState("");

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
        if (completion >= 75) {
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

      const relevantData = sortedData.slice(
        -numberOfDaysDisplayed * dataOffset
      );

      ///Get the time range label
      const timeRangeStart = getLabelDate(relevantData[0].day);
      const timeRangeEnd = getLabelDate(
        relevantData[relevantData.length - 1].day
      );
      setTimeRangeLabel(timeRangeStart + " - " + timeRangeEnd);

      const newData = relevantData.map((item) => {
        const dayCompletion = computeDayPlannerCompletion(
          dayPlannerFeatureConfig,
          item
        );

        const colorFromCompletion = getColorFromCompletion(dayCompletion);

        let additionalFields = {};
        if (numberOfDaysDisplayed <= 7) {
          additionalFields = {
            topLabelComponent: () => {
              return (
                <Text
                  fontSize={globalStyle.mediumMobileFont}
                  label={`${dayCompletion}%`}
                  style={{
                    width: 50,
                    color: colorFromCompletion,
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
          key: item.day,
          barBorderTopLeftRadius: globalStyle.borderRadius,
          labelTextStyle: {
            color: colorFromCompletion,
            fontSize: 14,
          },
          capThickness: numberOfDaysDisplayed > 7 ? 4 : 8,
          capColor: colorFromCompletion,
          ...additionalFields,
        };
      });

      ////get the comparison data
      if (numberOfDaysDisplayed === 7 && sortedData.length > 14) {
        const comparisonData = sortedData.slice(
          -numberOfDaysDisplayed * dataOffset - 14,
          -numberOfDaysDisplayed * dataOffset - 7
        );
        const comparisonDataMapped = comparisonData.map((item) => {
          const dayCompletion = computeDayPlannerCompletion(
            dayPlannerFeatureConfig,
            item
          );
          return {
            value: parseInt(dayCompletion),
            barWidth: 5,
            spacing: 2,
            key: item.day,
            frontColor: globalStyle.color + "30",
            barBorderTopRightRadius: globalStyle.borderRadius,
            barBorderTopLeftRadius: globalStyle.borderRadius,
            labelTextStyle: {
              color: globalStyle.colorInactive,
              fontSize: 14,
            },
            capThickness: 2,
            capColor: getColorFromCompletion(dayCompletion),
          };
        });

        const interlacedData = [];
        for (
          let i = 0;
          i < Math.max(comparisonDataMapped.length, newData.length);
          i++
        ) {
          if (i < comparisonDataMapped.length) {
            interlacedData.push(comparisonDataMapped[i]);
          }
          if (i < newData.length) {
            interlacedData.push(newData[i]);
          }
        }

        return interlacedData;
      }
      return newData;
    }

    return [];
  }, [
    setTimeRangeLabel,
    recentDayPlannerData,
    dayPlannerFeatureConfig,
    dataOffset,
    numberOfDaysDisplayed,
  ]);

  const buttonStyle = useCallback(() => {
    return {
      width: 80,
      height: "100%",
      borderWidth: 0,
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        gap: 5,
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          height: screenHeight - 0.2 * screenHeight,
          justifyContent: "flex-end",
          position: "relative",
          borderRadius: globalStyle.borderRadius,
        }}
      >
        <BarChart
          patternId="DiagonalLines"
          height={screenHeight - 0.2 * screenHeight - 180}
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
      <View
        style={{
          backgroundColor: globalStyle.color + layoutCardLikeBackgroundOpacity,
          borderRadius: globalStyle.borderRadius,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 45,
        }}
      >
        <Text
          style={{ paddingLeft: 10, fontSize: globalStyle.regularMobileFont }}
          label={timeRangeLabel}
        ></Text>
        <View
          style={{
            flexDirection: "row",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
            style={{
              ...buttonStyle(),
              borderRightWidth: 1,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
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
      </View>
    </View>
  );
}

export { DayPlannerChart };
