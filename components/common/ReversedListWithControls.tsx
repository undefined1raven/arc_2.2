import { layoutAnimationsDuration } from "@/constants/animations";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { FlashList } from "@shopify/flash-list";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Text from "./Text";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { ArrowDeco } from "../deco/ArrowDeco";
import Button from "./Button";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { SearchIcon } from "../deco/SearchIcon";
import { View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { EditDeco } from "../deco/EditDeco";
import { TessStatusType } from "@/constants/CommonTypes";

type ReversedListWithControlsProps = {
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  showBackButton: boolean;
  onBackButtonClick: () => void;
  showSearchBar: boolean;
  onSearch: (query: string) => void;
};

function ReversedListWithControls({
  data,
  renderItem,
  showBackButton,
  onBackButtonClick,
  showSearchBar,
  onSearch,
}: ReversedListWithControlsProps) {
  const globalStyle = useGlobalStyleStore();
  const virtualKeyboardApi = useVirtualKeyboard();

  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  return (
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
          data={data}
          estimatedItemSize={55}
          renderItem={renderItem}
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
              fontSize: globalStyle.globalStyle.regularMobileFont,
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
        {showBackButton && (
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
            onClick={onBackButtonClick}
          ></Button>
        )}
      </Animated.View>
      {virtualKeyboardApi.isVisible && (
        <Animated.View style={{ height: 25, width: "100%" }}></Animated.View>
      )}
    </Animated.View>
  );
}

export default ReversedListWithControls;
