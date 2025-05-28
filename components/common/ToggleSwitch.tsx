import { useGlobalStyleStore } from "@/stores/globalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import Button from "./Button";

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  style = {},
  thumbWidth = "25%",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  thumbWidth?: string;
}) {
  const [isChecked, setIsChecked] = useState(checked);
  const globalStyles = useGlobalStyleStore((store) => store.globalStyle);
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        backgroundColor: globalStyles.color + "30",
        borderRadius: globalStyles.borderRadius,
        display: "flex",
        justifyContent: "center",
        alignItems: isChecked ? "flex-end" : "flex-start",
      }}
    >
      <Button
        onClick={() => {
          if (disabled) return;
          setIsChecked(!isChecked);
          onChange(!isChecked);
        }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 10,
        }}
      ></Button>
      <View
        style={{
          height: "100%",
          width: thumbWidth,
          borderRadius: globalStyles.borderRadius,
          backgroundColor: globalStyles.color + (isChecked ? "" : "60"),
        }}
      ></View>
    </View>
  );
}

export { ToggleSwitch };
