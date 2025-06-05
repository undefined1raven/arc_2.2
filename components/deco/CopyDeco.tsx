import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import { View } from "react-native";
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Rect,
} from "react-native-svg";
const CopyDeco = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);

  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={21}
      height={25}
      viewBox="0 0 21 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        x={5.5}
        y={4.5}
        width={15}
        height={20}
        rx={1.5}
        fill={colorActual}
        fillOpacity={0.2}
        stroke={colorActual}
      />
      <Rect
        x={0.5}
        y={0.5}
        width={15}
        height={20}
        rx={1.5}
        fill={colorActual}
        fillOpacity={0.2}
        stroke={colorActual}
      />
    </Svg>
  );
};

export { CopyDeco };
