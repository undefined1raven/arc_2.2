import { useGlobalStyleStore } from "@/stores/globalStyles";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  type ViewProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const globalStyle = useGlobalStyleStore();
  const insets = useSafeAreaInsets();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      onPressIn={() => {
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={{ top: insets.top, ...style }} {...otherProps}>
        <>
          <LinearGradient
            colors={globalStyle.globalStyle.pageBackgroundColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.3, y: 0.7 }}
            style={{
              position: "absolute",
              top: "-20%",
              left: 0,
              width: "120%",
              height: "150%",
            }}
          ></LinearGradient>
          {otherProps.children}
        </>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
