import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import { View } from "react-native";
import Svg, { SvgProps, Path, Rect } from "react-native-svg";
const KeyDeco = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const colorActual = props.color ? props.color : globalStyle.color;
  return (
    <Svg
      width={13}
      height={22}
      viewBox="0 0 13 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        x={0.5}
        y={7.5}
        width={12}
        height={14}
        rx={2.5}
        stroke={colorActual}
      />
      <Path fill={colorActual} stroke={colorActual} d="M6 16.5H7V18.5H6z" />
      <Rect
        x={2.5}
        y={0.5}
        width={8}
        height={7}
        rx={0.5}
        stroke={colorActual}
      />
    </Svg>
  );
};

export { KeyDeco };
