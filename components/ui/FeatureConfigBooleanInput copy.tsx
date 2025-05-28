import Text from "../common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import TextInput from "../common/TextInput";
import { CheckBox } from "../common/CheckBox";
import { StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { ColorInput } from "../common/ColorPicker";
import Button from "../common/Button";
import { ToggleSwitch } from "../common/ToggleSwitch";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  inputProps?: { [key: string]: any };
  label: string;
};

function FeatureConfigBooleanInput(props: Props) {
  const globalStyle = useGlobalStyleStore();

  return (
    <View
      style={{
        width: "100%",
        height: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      {
        <View
          style={{
            width: "100%",
            height: 60,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text
            label={props.label}
            textAlign="left"
            style={{
              backgroundColor: globalStyle.globalStyle.color + "20",
              height: "100%",
              width: "100%",
              position: "absolute",
            }}
          ></Text>
          <View
            style={{
              width: "15%",
              height: "50%",
              position: "absolute",
              right: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ToggleSwitch
              thumbWidth="40%"
              checked={props.value}
              onChange={(e) => {
                props.onChange(e);
              }}
            ></ToggleSwitch>
          </View>
        </View>
      }
    </View>
  );
}

export { FeatureConfigBooleanInput };
