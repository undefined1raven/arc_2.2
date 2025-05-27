import Text from "../common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import TextInput from "../common/TextInput";
import { CheckBox } from "../common/CheckBox";
import { StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { ColorInput } from "../common/ColorPicker";
import Button from "../common/Button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  inputProps?: { [key: string]: any };
  label: string;
  labelWidthPercentage?: number;
};

function FeatureConfigColorInput(props: Props) {
  const globalStyle = useGlobalStyleStore();

  const [isPickingColor, setIsPickingColor] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    globalStyle.globalStyle.color
  );

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
        height: isPickingColor ? 300 : 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      {isPickingColor ? (
        <View style={{ width: "100%", height: "100%" }}>
          <ColorInput
            colorPickerStyle={{
              height: "100%",
              width: "100%",
              marginBottom: 10,
            }}
            onChange={(e) => {
              setSelectedColor(e);
            }}
          ></ColorInput>
          <View style={{ height: 10, width: "100%" }}></View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              marginBottom: 10,
              marginTop: 10,
              height: 50,
            }}
          >
            <Button
              style={{
                width: "50%",
                height: "100%",
                marginTop: 10,
              }}
              onClick={() => {
                setIsPickingColor(false);
              }}
              label="Cancel"
            ></Button>
            <Button
              style={{ width: "50%", height: "100%", marginTop: 10 }}
              onClick={() => {
                props.onChange(selectedColor);
                setIsPickingColor(false);
              }}
              label="Done"
            ></Button>
          </View>
        </View>
      ) : (
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
              width: props.labelWidthPercentage
                ? `${props.labelWidthPercentage}%`
                : "35%",
            }}
          ></Text>
          <Button
            style={{
              ...styles().inputCoreStyle,
              borderColor: props.value
                ? props.value
                : globalStyle.globalStyle.color,
            }}
            onClick={() => {
              setIsPickingColor(true);
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: globalStyle.globalStyle.borderRadius,
                backgroundColor: props.value,
              }}
            ></View>
          </Button>
        </View>
      )}
    </View>
  );
}

export { FeatureConfigColorInput };
