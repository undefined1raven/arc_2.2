import Text from "@/components/common/Text";
import { HexDeco } from "@/components/deco/HexDeco";
import { XDeco } from "@/components/deco/XDeco";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import {
  HabitCardDataShape,
  useHabitCardDataApi,
} from "@/stores/viewState/habitCardData";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";
import { View } from "react-native";

function HabitTrackerList({
  activitiesLabelWidth,
}: {
  activitiesLabelWidth: number;
}) {
  const habitData = useHabitCardDataApi((state) => state.derivedData);
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const renderItem = useCallback(
    ({ item, index }: { item: HabitCardDataShape; index: number }) => {
      const isLastItem = index + 1 === habitData?.length;
      const habitDataDurationMap = item.streakData.map((data) => data.duration);

      return (
        <View
          style={{
            width: "100%",
            height: 32,
            display: "flex",
            flexDirection: "row",
            borderBottomColor: globalStyle.color + "40",
            borderBottomWidth: isLastItem ? 0 : 1,
            borderColor: globalStyle.color + "40",
          }}
        >
          <View
            style={{
              width: `${activitiesLabelWidth}%`,
              height: "100%",
              borderRightColor: globalStyle.color + "40",
              borderRightWidth: 1,
              paddingLeft: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text
              fontSize={globalStyle.mediumMobileFont}
              label={item.activityName}
            ></Text>
          </View>
          <View
            style={{
              width: `${100 - activitiesLabelWidth}%`,
              height: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: 5,
              paddingRight: 5,
            }}
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <View
                key={index}
                style={{
                  height: 26,
                  aspectRatio: 1,
                  borderRadius: 5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor:
                    (habitDataDurationMap[index] > 0
                      ? globalStyle.successColor
                      : globalStyle.errorColor) + "20",
                }}
              >
                {habitDataDurationMap[index] > 0 ? (
                  <HexDeco
                    width={18}
                    height={18}
                    color={globalStyle.successColor}
                  ></HexDeco>
                ) : (
                  <XDeco
                    width={15}
                    height={15}
                    color={globalStyle.errorColor + "AA"}
                  ></XDeco>
                )}
              </View>
            ))}
          </View>
        </View>
      );
    },
    [habitData, globalStyle, activitiesLabelWidth],
  );

  return (
    <FlashList
      estimatedItemSize={32}
      data={habitData}
      renderItem={renderItem}
    ></FlashList>
  );
}

export { HabitTrackerList };
