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
import { HexDeco } from "../deco/HexDeco";

function Selection({
  selectionBoxStyle = {},
  values,
  value,
  labelKeys = [],
  onSelection = (value: any) => {},
  renderItem,
  multiselect = false,
  onMultiSelection = (values: any[]) => {},
  customSelectionButton = undefined,
  multiselectMatchKeys = [],
}: {
  selectionBoxStyle?: Object;
  values: any[];
  value: any | any[]; ////Or values if multiselect is true
  labelKeys?: string[];
  onSelection: (value: any) => void;
  renderItem?: (item: any) => React.ReactNode;
  multiselect?: boolean;
  onMultiSelection?: (values: any[]) => void;
  customSelectionButton?: (props: { onClick: () => void }) => React.ReactNode;
  multiselectMatchKeys?: string[];
}) {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const [localSelectedValues, setLocalSelectedValues] = useState<any[]>(value);
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
    customSelectionButton ? (
      customSelectionButton({
        onClick: () => {
          setIsSelecting(true);
        },
      })
    ) : (
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
    )
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
              extraData={localSelectedValues}
              renderItem={({ item, index }) => {
                let isValueSelected = false;

                if (multiselect && Array.isArray(value)) {
                  if (
                    Array.isArray(multiselectMatchKeys) &&
                    multiselectMatchKeys.length > 0
                  ) {
                    const itemValue = getValueByKeys(
                      item,
                      multiselectMatchKeys
                    );

                    isValueSelected = localSelectedValues.includes(itemValue);
                  } else {
                    isValueSelected = localSelectedValues.includes(item);
                  }
                }

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
                          if (multiselect) {
                            const newValues = [...localSelectedValues];
                            if (
                              Array.isArray(multiselectMatchKeys) &&
                              multiselectMatchKeys.length > 0
                            ) {
                              const newValue = getValueByKeys(
                                item,
                                multiselectMatchKeys
                              );
                              if (newValues.includes(newValue)) {
                                const index = newValues.indexOf(newValue);
                                if (index > -1) {
                                  newValues.splice(index, 1);
                                }
                              } else {
                                newValues.push(newValue);
                              }
                              setLocalSelectedValues(newValues);
                            }
                          } else {
                            onSelection(item);
                            setIsSelecting(false);
                          }
                        }}
                        textStyle={{ textAlign: "left", paddingLeft: 10 }}
                        style={{ width: "100%", height: "100%" }}
                        label={label}
                      ></Button>
                      {isValueSelected && (
                        <View style={{ position: "absolute", right: 10 }}>
                          <HexDeco
                            width={20}
                            height={20}
                            color={globalStyle.color}
                            opacity={isValueSelected ? 1 : 0.4}
                          ></HexDeco>
                        </View>
                      )}
                    </View>
                  );
                }
              }}
            ></FlashList>
          </View>
          <Button
            onClick={() => {
              if (multiselect) {
                onMultiSelection(localSelectedValues);
              }
              setIsSelecting(false);
            }}
            style={{ height: 60, width: "100%" }}
            label={multiselect ? "Done" : "Close"}
          ></Button>
        </View>
      </SafeAreaView>
    </Portal>
  );
}

export { Selection };
