import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { StatusIndicators } from "@/components/ui/StatusIndicators";
import { TextInput } from "react-native-gesture-handler";
import { SearchIcon } from "@/components/deco/SearchIcon";
import Button from "@/components/common/Button";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { useCallback } from "react";
import { layoutAnimationsDuration } from "@/constants/animations";
import { FlashList } from "@shopify/flash-list";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import Text from "@/components/common/Text";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { AddIcon } from "@/components/deco/AddIcon";
import { EditDeco } from "@/components/deco/EditDeco";
function EditActivities() {
  const globalStyle = useGlobalStyleStore();
  const navMenuApi = useNavMenuApi();
  const virtualKeyboardApi = useVirtualKeyboard();
  const timeTrackingFeatureConfigApi = useFeatureConfigs(
    (store) => store.timeTrackingFeatureConfig
  );
  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <Animated.View
          style={{
            width: "100%",
            borderRadius: globalStyle.globalStyle.borderRadius,
            display: "flex",
            justifyContent: "center",
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
              position: "relative",
              width: "100%",
              top: "0%",
              flexGrow: 1,
            }}
          >
            <FlashList
              inverted={true}
              data={timeTrackingFeatureConfigApi.filter(
                (r) => r.type === "task"
              )}
              estimatedItemSize={55}
              renderItem={({ item }) => {
                return (
                  <Button
                    textStyle={{ textAlign: "left", paddingLeft: 10 }}
                    onClick={() => {}}
                    style={{
                      height: 55,
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    label={item.itme.name}
                  >
                    <EditDeco
                      height={30}
                      width={30}
                      style={{ position: "absolute", right: 10, zIndex: -1 }}
                    ></EditDeco>
                  </Button>
                );
              }}
            />
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
            }}
          >
            <View
              style={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <TextInput
                textAlign="left"
                placeholder="Search activities or categories"
                onChange={(e) => {
                  const text = e.nativeEvent.text;
                }}
                style={{
                  height: "100%",
                  marginBottom: 0,
                  bottom: 0,
                  paddingLeft: 30,
                  borderRadius: globalStyle.globalStyle.borderRadius,
                  display: "flex",
                  borderColor: globalStyle.globalStyle.color,
                  borderWidth: 1,
                  backgroundColor: globalStyle.globalStyle.color + "20",
                }}
              ></TextInput>
              <SearchIcon
                style={{ position: "absolute", left: 8, zIndex: -1 }}
              ></SearchIcon>
            </View>
            <Button
              style={{
                height: "100%",
                width: "20%",
                marginBottom: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 5,
              }}
              label=""
              onClick={() => {}}
            >
              <AddIcon
                width={30}
                height={25}
                style={{
                  transform: [{ rotate: "180deg" }],
                  width: "60%",
                  height: "60%",
                }}
              ></AddIcon>
            </Button>
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
export default EditActivities;

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
