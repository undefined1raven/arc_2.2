import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback } from "react";
import { View } from "react-native";

function DayBar({
  dayIndex,
  dayCompletionData,
  dayLabel,
}: {
  dayIndex: number;
  dayCompletionData: number | null;
  dayLabel: string;
}) {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);

  return (
    <View
      key={dayIndex}
      style={{
        display: "flex",
        height: "100%",
        width: `${100 / 7 - 5}%`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <View
        style={{
          backgroundColor:
            dayCompletionData !== null
              ? globalStyle.color + "40"
              : globalStyle.colorInactive + "40",
          borderRadius: globalStyle.borderRadius,
          overflow: "hidden",
          width: "80%",
          flex: 1,
        }}
      >
        {dayCompletionData !== null && (
          <View
            style={{
              top: `${100 - (dayCompletionData ?? 0)}%`,
              height: `${dayCompletionData ?? 0}%`,
              width: "100%",
              backgroundColor:
                dayCompletionData >= 75
                  ? dayCompletionData !== 100
                    ? globalStyle.successColor + "CC"
                    : globalStyle.successColor
                  : globalStyle.color,
            }}
          ></View>
        )}
      </View>
      {dayCompletionData === null ? (
        <Text
          color={globalStyle.textColorAccent}
          style={{ minHeight: "auto" }}
          fontSize={15}
          label={dayLabel}
        ></Text>
      ) : (
        <Text
          color={
            dayCompletionData >= 75
              ? dayCompletionData !== 100
                ? globalStyle.successTextColor + "CC"
                : globalStyle.successTextColor
              : globalStyle.textColor
          }
          style={{ minHeight: "auto" }}
          fontSize={15}
          label={dayLabel}
        ></Text>
      )}
    </View>
  );
}

export { DayBar };
