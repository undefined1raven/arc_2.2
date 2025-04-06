import { ANDROID_RIPPLE_TRANSPARENCY } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleProp,
  Text as RNText,
  TouchableHighlight,
  ViewStyle,
  TextInput as RNTextInput,
} from "react-native";
import Animated from "react-native-reanimated";
import { FadeIn, FadeOut } from "react-native-reanimated";
type ButtonProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "visible-password";
  onClick: () => void;
  fontSize?: number;
  textAlign: "left" | "right" | "center";
  textAlignVertical: "center" | "top" | "bottom";
};

function TextInput({
  borderColor,
  backgroundColor,
  placeholder,
  style,
  color,
  fontSize,
  textAlign,
  textAlignVertical,
  keyboardType,
}: ButtonProps) {
  const globalStyles = useGlobalStyleStore();

  return (
    <RNTextInput
      placeholder={placeholder ? placeholder : ""}
      style={{
        textAlign: textAlign ? textAlign : "center",
        textAlignVertical: textAlignVertical ? textAlignVertical : "center",
        color: color ? color : globalStyles.globalStyle.textColor,
        fontSize: fontSize
          ? fontSize
          : globalStyles.globalStyle.largeMobileFont,
        fontFamily: "OxaniumRegular",
        backgroundColor: backgroundColor
          ? backgroundColor
          : globalStyles.globalStyle.color + "20",
        borderColor: borderColor ? borderColor : globalStyles.globalStyle.color,
        borderWidth: 1,
        borderRadius: globalStyles.globalStyle.borderRadius,
        paddingLeft: textAlign === "left" ? 10 : 0,
        paddingRight: textAlign === "right" ? 10 : 0,
        ...style,
      }}
      keyboardType={keyboardType ? keyboardType : "default"}
    ></RNTextInput>
  );
}
export default TextInput;
