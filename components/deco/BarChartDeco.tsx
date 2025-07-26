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
  Circle,
} from "react-native-svg";
const BarChartDeco = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const [opacityArray, setOpacityArray] = React.useState([]);
  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={11}
      height={20}
      viewBox="0 0 11 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        x={0.5}
        y={19.5}
        width={4.33333}
        height={1.66667}
        rx={0.833333}
        transform="rotate(-90 .5 19.5)"
        fill={colorActual}
        stroke={colorActual}
      />
      <Rect
        x={4.5}
        y={19.5}
        width={13.6667}
        height={1.66667}
        rx={0.833333}
        transform="rotate(-90 4.5 19.5)"
        fill={colorActual}
        stroke={colorActual}
      />
      <Rect
        x={8.5}
        y={19.5}
        width={19}
        height={1.66667}
        rx={0.833333}
        transform="rotate(-90 8.5 19.5)"
        fill={colorActual}
        stroke={colorActual}
      />
    </Svg>
  );
};

export { BarChartDeco };
