import { useGlobalStyleStore } from "@/stores/globalStyles";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Portal } from "react-native-portalize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getValueByKeys } from "../utils/fn/geetValueByKeys";
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "../deco/Dropdown";

function Selection({
  selectionBoxStyle = {},
  values,
  value,
  labelKeys = [],
  onSelection = (value: any) => {},
  renderItem,
}: {
  selectionBoxStyle?: Object;
  values: any[];
  value: any;
  labelKeys?: string[];
  onSelection: (value: any) => void;
  renderItem?: (item: any) => React.ReactNode;
}) {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const [isSelecting, setIsSelecting] = useState(false);
  const insets = useSafeAreaInsets();
  const [currentLabel, setCurrentLabel] = useState<string>("");

  useEffect(() => {
    if (typeof value === "string") {
      setCurrentLabel(value);
    } else if (typeof value === "object" && labelKeys.length > 0) {
      const label = getValueByKeys(value, labelKeys);
      if (typeof label === "string") {
        setCurrentLabel(label);
      } else {
        setCurrentLabel("[No label]");
      }
    }
  }, [value]);

  return isSelecting === false ? (
    <Button
      onClick={() => {
        setIsSelecting(true);
      }}
      textStyle={{ textAlign: "left", paddingLeft: 10 }}
      label={currentLabel}
      style={{
        height: 60,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "space-between",
        paddingRight: 10,
        ...selectionBoxStyle,
      }}
    >
      <Dropdown width={40} height={40}></Dropdown>
    </Button>
  ) : (
    <Portal>
      <SafeAreaView style={{ top: 0, flex: 1 }}>
        <LinearGradient
          colors={globalStyle.pageBackgroundColors}
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
        <View
          style={{
            width: "100%",
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            paddingLeft: 5,
            paddingRight: 5,
            gap: 5,
          }}
        >
          <View style={{ flexGrow: 1, width: "100%" }}>
            <FlashList
              inverted={true}
              data={values}
              estimatedItemSize={60}
              renderItem={({ item, index }) => {
                if (renderItem !== undefined) {
                  return renderItem(item);
                } else {
                  let label = "";
                  if (typeof item === "string") {
                    label = item;
                  } else {
                    if (labelKeys && labelKeys.length > 0) {
                      const itemLabel = getValueByKeys(item, labelKeys);
                      if (typeof itemLabel === "string") {
                        label = itemLabel;
                      } else {
                        label = "[No label]";
                      }
                    }
                  }
                  return (
                    <View
                      style={{
                        height: 55,
                        marginBottom: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Button
                        onClick={() => {
                          onSelection(item);
                          setIsSelecting(false);
                        }}
                        textStyle={{ textAlign: "left", paddingLeft: 10 }}
                        style={{ width: "100%", height: "100%" }}
                        label={label}
                      ></Button>
                    </View>
                  );
                }
              }}
            ></FlashList>
          </View>
          <Button
            onClick={() => {
              setIsSelecting(false);
            }}
            style={{ height: 60, width: "100%" }}
            label="Cancel"
          ></Button>
        </View>
      </SafeAreaView>
    </Portal>
  );
}

export { Selection };
