import { useGlobalStyleStore } from "@/stores/globalStyles";
import { View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

  return (
    <View style={[style]} {...otherProps}>
      <>
        <LinearGradient
          colors={globalStyle.globalStyle.pageBackgroundColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 0.7 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "120%",
            height: "120%",
          }}
        ></LinearGradient>
        {otherProps.children}
      </>
    </View>
  );
}
