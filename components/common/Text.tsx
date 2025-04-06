import { ANDROID_RIPPLE_TRANSPARENCY } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleProp,
  Text as RNText,
  TouchableHighlight,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import { FadeIn, FadeOut } from "react-native-reanimated";
type ButtonProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  onClick: () => void;
  fontSize?: number;
  textAlign: "left" | "right" | "center";
  textAlignVertical: "center" | "top" | "bottom";
};

function Text({
  borderColor,
  backgroundColor,
  label,
  style,
  color,
  fontSize,
  textAlign,
  textAlignVertical,
}: ButtonProps) {
  const globalStyles = useGlobalStyleStore();

  return (
    <RNText
      style={{
        textAlign: textAlign ? textAlign : "center",
        textAlignVertical: textAlignVertical ? textAlignVertical : "center",
        color: color ? color : globalStyles.globalStyle.textColor,
        fontSize: fontSize
          ? fontSize
          : globalStyles.globalStyle.largeMobileFont,
        fontFamily: "OxaniumRegular",
        backgroundColor: backgroundColor ? backgroundColor : "transparent",
        borderColor: borderColor ? borderColor : "#00000000",
        borderWidth: 1,
        borderRadius: globalStyles.globalStyle.borderRadius,
        ...style,
      }}
    >
      {label}
    </RNText>
  );
}
export default Text;
