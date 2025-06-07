import { ANDROID_RIPPLE_TRANSPARENCY } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { Children, useEffect, useState } from "react";
import {
  Keyboard,
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
  fontSize?: number;
  textStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onDoubleClick?: () => void;
  androidRippleColor?: string | null;
  onLongPress?: () => void; // Optional long press handler
};

function Button({
  borderColor,
  backgroundColor,
  label,
  style,
  color,
  onClick = () => {},
  fontSize,
  textAlign,
  textAlignVertical,
  onDoubleClick,
  children,
  textStyle,
  androidRippleColor,
  disabled,
  onLongPress = () => {}, // Default to no-op if not provided
}: ButtonProps) {
  const globalStyles = useGlobalStyleStore();
  const [lastTap, setLastTap] = useState<number | null>(null);

  const handlePress = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      if (onDoubleClick) {
        // If the second tap is within 300ms, it's a double-tap
        onDoubleClick?.();
      }
    } else {
      setLastTap(now);
      onClick();
    }
    Keyboard.dismiss();
  };

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={handlePress}
      android_ripple={
        disabled || androidRippleColor === null
          ? null
          : {
              color: androidRippleColor
                ? androidRippleColor
                : globalStyles.globalStyle.androidRippleColor +
                  ANDROID_RIPPLE_TRANSPARENCY,
            }
      }
      android_disableSound={true}
      style={{
        borderRadius: globalStyles.globalStyle.borderRadius,
        borderWidth: 1,
        borderColor: borderColor
          ? borderColor
          : disabled
          ? globalStyles.globalStyle.colorInactive
          : globalStyles.globalStyle.color,
        ...style,
      }}
    >
      <>
        <Text
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            textAlign: textAlign ? textAlign : "center",
            textAlignVertical: textAlignVertical ? textAlignVertical : "center",
            color: color
              ? color
              : disabled
              ? globalStyles.globalStyle.textColorInactive
              : globalStyles.globalStyle.textColor,
            fontSize: fontSize
              ? fontSize
              : globalStyles.globalStyle.largeMobileFont,
            fontFamily: "OxaniumRegular",
            paddingLeft: textAlign === "left" ? 10 : 0,
            paddingRight: textAlign === "right" ? 10 : 0,
            ...textStyle,
          }}
        >
          {label}
        </Text>
        {children}
      </>
    </Pressable>
  );
}
export default Button;
