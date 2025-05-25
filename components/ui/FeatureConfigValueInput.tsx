import Text from "../common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import TextInput from "../common/TextInput";
import { CheckBox } from "../common/CheckBox";
import { StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { ColorInput } from "../common/ColorPicker";

type Props = {
  inputType: "text" | "number" | "boolean" | "color" | "select";
  value: string;
  onChange: (value: string) => void;
  inputProps?: { [key: string]: any };
  label: string;
  labelWidthPercentage?: number;
  height?: number;
};

function FeatureConfigValueInput(props: Props) {
  const globalStyle = useGlobalStyleStore();

  const inputTypeToComponent = {
    text: TextInput,
    number: TextInput,
    boolean: CheckBox,
    color: ColorInput,
    select: Text,
  };

  const styles = useCallback(() => {
    return StyleSheet.create({
      inputCoreStyle: {
        height: "97%",
        top: "1.5%",
        position: "relative",
        flexGrow: 1,
        marginLeft: 5,
        marginBottom: 5,
        width: `${100 - (props.labelWidthPercentage || 35)}%`,
      },
    });
  }, [props.labelWidthPercentage]);

  return (
    <View
      style={{
        width: "100%",
        height: props.height ? props.height : 60,
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
          width: props.labelWidthPercentage
            ? `${props.labelWidthPercentage}%`
            : "35%",
        }}
      ></Text>
      {inputTypeToComponent[props.inputType](
        props.inputProps
          ? {
              style: { ...styles().inputCoreStyle },
              defaultValue: props.value,
              onChange: (e: any) => {
                switch (props.inputType) {
                  case "boolean":
                    props.onChange(e);
                    return;
                  case "number":
                    props.onChange(e.nativeEvent.text);
                    return;
                  case "color":
                    props.onChange(e);
                    return;
                  default:
                    break;
                }
              },
              ...props.inputProps,
            }
          : {
              style: { ...styles().inputCoreStyle },
              defaultValue: props.value,
              onChange: (e: any) => {
                switch (props.inputType) {
                  case "boolean":
                    props.onChange(e);
                    return;
                  case "number":
                    props.onChange(e.nativeEvent.text);
                    return;
                  case "color":
                    props.onChange(e);
                    return;
                  default:
                    break;
                }
              },
            }
      )}
    </View>
  );
}

export { FeatureConfigValueInput };
