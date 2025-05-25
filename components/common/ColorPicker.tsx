import { View, StyleSheet } from "react-native";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
} from "reanimated-color-picker";

function ColorInput({
  color,
  onChange,
  colorPickerStyle = {},
}: {
  color: string;
  onChange: (color: string) => void;
  colorPickerStyle?: any;
}) {
  const selectedColor = useSharedValue<any>({
    hex: color,
    rgba: { r: 0, g: 0, b: 0, a: 1 },
    hsv: { h: 0, s: 0, v: 0 },
  });

  return (
    <View style={styles.container}>
      <ColorPicker
        style={{ ...styles.container, ...colorPickerStyle }}
        value={color}
        onChange={(newColor) => {
          "worklet";
          // Send selected hex to parent
          runOnJS(onChange)(newColor.hex);
        }}
        selectedColor={selectedColor}
      >
        <Preview />
        <Panel1 />
        <HueSlider></HueSlider>
      </ColorPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginBottom: 50,
  },
});

export { ColorInput };
