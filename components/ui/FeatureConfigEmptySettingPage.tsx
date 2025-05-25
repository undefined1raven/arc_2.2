import { StyleSheet } from "react-native";
import { ThemedView } from "../ThemedView";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { EditDeco } from "../deco/EditDeco";
import { layoutAnimationsDuration } from "@/constants/animations";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Button from "../common/Button";
import { useCallback } from "react";
import Text from "../common/Text";

type Props = {
  bototmHeaderLabel: string;
  bottomHeaderButtonLabel?: string;
  bottomHeaderButtonOnPress: () => void;
  children: React.ReactNode;
};

function FeatureConfigEmptySettingPage(props: Props) {
  const virtualKeyboardApi = useVirtualKeyboard();
  const globalStyle = useGlobalStyleStore();

  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  return (
    <>
      <ThemedView
        style={{ ...styles.container, height: "100%", width: "100%" }}
      >
        <Animated.View
          style={{
            width: "100%",
            borderRadius: globalStyle.globalStyle.borderRadius,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            bottom: 0,
            flexGrow: 1,
          }}
        >
          {virtualKeyboardApi.isVisible && (
            <Animated.View
              style={{
                height: virtualKeyboardApi.keyboardHeight,
                width: "100%",
              }}
            ></Animated.View>
          )}
          <Animated.View
            entering={customFadeInUp(layoutAnimationsDuration)}
            style={{
              width: "100%",
              bottom: 0,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 70,
              gap: 10,
            }}
          >
            {props.children}
          </Animated.View>
          <Animated.View
            entering={customFadeInDown(layoutAnimationsDuration)}
            style={{
              marginTop: 5,
              height: 60,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              position: "absolute",
              bottom: 0,
            }}
          >
            <Text
              textAlign="left"
              style={{
                width: "80%",
                height: "100%",
                backgroundColor: globalStyle.globalStyle.color + "20",
              }}
              label={props.bototmHeaderLabel}
            />
            <Button
              onClick={props.bottomHeaderButtonOnPress}
              label={
                props.bottomHeaderButtonLabel
                  ? props.bottomHeaderButtonLabel
                  : "Save"
              }
              style={{
                marginLeft: 5,
                width: "20%",
                height: "100%",
                borderRadius: globalStyle.globalStyle.borderRadius,
              }}
            ></Button>
          </Animated.View>
          {virtualKeyboardApi.isVisible && (
            <Animated.View
              style={{ height: 25, width: "100%" }}
            ></Animated.View>
          )}
        </Animated.View>
      </ThemedView>
    </>
  );
}
export default FeatureConfigEmptySettingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
