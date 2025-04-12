import { ANDROID_RIPPLE_TRANSPARENCY } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import React, { useState } from "react";
import { Pressable, useAnimatedValue } from "react-native";

function CheckBox({
  checked,
  onChange,
  style,
  uncheckedColor,
  checkedColor,
  uncheckedBorderColor,
  checkedBorderColor,
  hitSlop,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  borderColor?: string;
  style?: React.CSSProperties;
  uncheckedColor?: string;
  checkedColor?: string;
  uncheckedBorderColor?: string;
  checkedBorderColor?: string;
  hitSlop?: number;
}) {
  const globalStyles = useGlobalStyleStore();
  const [checkedState, setCheckedState] = useState(checked);

  return (
    <Pressable
      hitSlop={hitSlop ? hitSlop : 2}
      onPress={() => {
        setCheckedState(!checkedState);
        onChange(!checkedState);
      }}
      android_ripple={{
        color:
          globalStyles.globalStyle.androidRippleColor +
          ANDROID_RIPPLE_TRANSPARENCY,
      }}
      android_disableSound={true}
      style={{
        borderRadius: globalStyles.globalStyle.borderRadius,
        borderWidth: 1,
        borderColor: checkedState
          ? checkedBorderColor
            ? checkedBorderColor
            : globalStyles.globalStyle.color
          : uncheckedBorderColor
          ? uncheckedBorderColor
          : globalStyles.globalStyle.color,
        backgroundColor: checkedState
          ? globalStyles.globalStyle.color
          : globalStyles.globalStyle.color + "20",
        ...style,
      }}
    ></Pressable>
  );
}

export { CheckBox };
