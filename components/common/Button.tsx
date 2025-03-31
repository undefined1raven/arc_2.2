import { ANDROID_RIPPLE_TRANSPARENCY } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleProp,
  Text,
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
};

function Button({
  borderColor,
  backgroundColor,
  label,
  style,
  color,
  onClick,
}: ButtonProps) {
  const globalStyles = useGlobalStyleStore();

  return (
    <Pressable
      onPress={onClick}
      android_ripple={{
        color:
          globalStyles.globalStyle.androidRippleColor +
          ANDROID_RIPPLE_TRANSPARENCY,
      }}
      android_disableSound={true}
      style={{
        borderRadius: globalStyles.globalStyle.borderRadius,
        borderWidth: 1,
        borderColor: borderColor ? borderColor : globalStyles.globalStyle.color,
        ...style,
      }}
    >
      <Text
        style={{
          width: "100%",
          height: "100%",
          textAlign: "center",
          textAlignVertical: "center",
          color: color ? color : globalStyles.globalStyle.textColor,
          fontSize: globalStyles.globalStyle.largeMobileFont,
          fontFamily: "OxaniumRegular",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export default Button;
