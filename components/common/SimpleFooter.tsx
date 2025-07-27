import { useGlobalStyleStore } from "@/stores/globalStyles";
import Button from "./Button";
import Text from "./Text";
import { router } from "expo-router";
import { Dropdown } from "../deco/Dropdown";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

function SimpleFooter(props: {
  label: string;
  showEnteringAnimation?: boolean;
  onBackButtonClick?: () => void;
}) {
  const globalStyle = useGlobalStyleStore((g) => g.globalStyle);

  return (
    <Animated.View
      entering={props.showEnteringAnimation ? FadeInDown : undefined}
      style={{ width: "100%", height: 65 }}
    >
      <Text
        textAlign="left"
        label={props.label}
        style={{
          flexShrink: 0,
          width: "100%",
          height: 65,
          paddingLeft: 90,
          backgroundColor: globalStyle.color + layoutCardLikeBackgroundOpacity,
        }}
      ></Text>
      <Button
        onClick={() => {
          if (props.onBackButtonClick) {
            props.onBackButtonClick();
          } else {
            router.back();
          }
        }}
        style={{
          borderRadius: 0,
          borderWidth: 0,
          borderRightWidth: 1,
          position: "absolute",
          bottom: 0,
          width: 80,
          height: 65,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Dropdown style={{ transform: [{ rotate: "90deg" }] }}></Dropdown>
      </Button>
    </Animated.View>
  );
}

export { SimpleFooter };
