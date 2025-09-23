import { ThemedView } from "@/components/ThemedView";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import {
  TessDayLogType,
  TessStatusType,
  TessTaskType,
} from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from "react-native";
import { DayPlannerCard } from "../dayPlanner/DayPlannerCard";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { layoutAnimationsDuration } from "@/constants/animations";
import { FlashList } from "@shopify/flash-list";
import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import {
  ANDROID_RIPPLE_TRANSPARENCY,
  layoutCardLikeBackgroundOpacity,
} from "@/constants/colors";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import TextInput from "@/components/common/TextInput";
import { SearchIcon } from "@/components/deco/SearchIcon";
import { AddIcon } from "@/components/deco/AddIcon";
import { router } from "expo-router";
import { v4 } from "uuid";
import { debounce } from "lodash";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
function historicDayView() {
  const historicDayView = useDayPlannerActiveDay(
    (store) => store.historicDayView
  );
  const featureConfigApi = useFeatureConfigs();
  const globalStyle = useGlobalStyleStore();
  const virtualKeyboardApi = useVirtualKeyboard();
  const [endDayLabel, setEndDayLabel] = useState<string>("End Day");
  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  const getStatusNameForTask = useCallback(
    (task: TessTaskType) => {
      const statusId = task.statusID;
      const status = featureConfigApi.dayPlannerFeatureConfig.find(
        (status: TessStatusType) => status.statusID === statusId
      );
      if (status) {
        return status.name;
      } else {
        return "Unknown Status";
      }
    },
    [featureConfigApi.dayPlannerFeatureConfig]
  );

  const getStatusColorsForTask = useCallback(
    (task: TessTaskType) => {
      function returnDefaultColors() {
        return {
          color: globalStyle.globalStyle.color,
          textColor: globalStyle.globalStyle.textColor,
        };
      }

      const statusId = task.statusID;
      const status = featureConfigApi.dayPlannerFeatureConfig.find(
        (status: TessStatusType) => status.statusID === statusId
      );
      if (status) {
        const statusColors = status.colors;
        if (statusColors === "default") {
          return returnDefaultColors();
        } else {
          const schemeColors =
            statusColors[globalStyle.globalStyle.colorScheme];
          if (!schemeColors) {
            return returnDefaultColors();
          }
          const themeColors = schemeColors[globalStyle.globalStyle.theme];
          if (!themeColors) {
            return returnDefaultColors();
          }
          return {
            color: themeColors.color,
            textColor: themeColors.textColor,
          };
        }
      } else {
        return returnDefaultColors();
      }
    },
    [featureConfigApi.dayPlannerFeatureConfig]
  );

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      <Animated.View
        style={{
          width: "100%",
          borderRadius: globalStyle.globalStyle.borderRadius,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          bottom: virtualKeyboardApi.isVisible
            ? virtualKeyboardApi.keyboardHeight
            : 0,
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
            data={historicDayView?.tasks}
            estimatedItemSize={55}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    transform: [{ rotate: "180deg" }],
                    width: "100%",
                    height: 50,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                  }}
                >
                  <Text
                    label="No Tasks"
                    style={{
                      width: "80%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      borderRadius: globalStyle.globalStyle.borderRadius,
                      backgroundColor:
                        globalStyle.globalStyle.color +
                        layoutCardLikeBackgroundOpacity,
                    }}
                  ></Text>
                </View>
              );
            }}
            renderItem={({ item }) => {
              const typedItem = item as TessDayLogType["tasks"][number];
              return (
                <View
                  style={{
                    height: 55,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "space-between",
                    borderWidth: 1,
                    borderRadius: globalStyle.globalStyle.borderRadius,
                    borderColor: getStatusColorsForTask(typedItem).color,
                  }}
                >
                  <TextInput
                    defaultValue={typedItem.name}
                    onChange={(e) => {}}
                    textAlign="left"
                    readOnly={true}
                    color={getStatusColorsForTask(typedItem).textColor}
                    style={{
                      position: "absolute",
                      left: 0,
                      flexGrow: 1,
                      height: "100%",
                      backgroundColor: "#00000000",
                      borderWidth: 0,
                      width: "64%",
                    }}
                  ></TextInput>
                  <Button
                    style={{
                      width: "35%",
                      position: "absolute",
                      right: 10,
                      height: "100%",
                      borderWidth: 0,
                    }}
                    androidRippleColor={null}
                    onClick={() => {}}
                  ></Button>
                  <Text
                    style={{
                      width: "35%",
                      position: "absolute",
                      right: 10,
                      height: "50%",
                      paddingBottom: 3,
                      paddingTop: 3,
                      zIndex: -1,
                    }}
                    color={getStatusColorsForTask(typedItem).textColor}
                    label={getStatusNameForTask(typedItem)}
                    backgroundColor={
                      getStatusColorsForTask(typedItem).color + 35
                    }
                    fontSize={15}
                  ></Text>
                </View>
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
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              flexDirection: "row",
              borderRadius: globalStyle.globalStyle.borderRadius,
            }}
          >
            <Button
              onClick={() => {
                router.back();
              }}
              style={{
                height: "80%",
                width: "20%",
                borderWidth: 0,
                borderRightWidth: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowDeco
                width={40}
                height={40}
                style={{ transform: [{ rotate: "180deg" }] }}
              ></ArrowDeco>
            </Button>
            <Text
              style={{
                flexGrow: 1,
                height: "80%",
                marginLeft: 15,
                marginRight: 15,
                borderRadius: globalStyle.globalStyle.borderRadius,
                backgroundColor:
                  globalStyle.globalStyle.color +
                  layoutCardLikeBackgroundOpacity,
              }}
              label={historicDayView?.day}
            ></Text>
          </View>
        </Animated.View>
        {virtualKeyboardApi.isVisible && (
          <Animated.View style={{ height: 25, width: "100%" }}></Animated.View>
        )}
      </Animated.View>
    </ThemedView>
  );
}
export default historicDayView;
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
