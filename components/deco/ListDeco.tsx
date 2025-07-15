import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import Svg, { SvgProps, Path, Rect } from "react-native-svg";
const ListDeco = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={15}
      height={11}
      viewBox="0 0 15 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect width={2} height={2} rx={1} fill={colorActual} />
      <Rect x={3} width={12} height={2} rx={1} fill={colorActual} />
      <Rect y={3} width={2} height={2} rx={1} fill={colorActual} />
      <Rect x={3} y={3} width={12} height={2} rx={1} fill={colorActual} />
      <Rect y={6} width={2} height={2} rx={1} fill={colorActual} />
      <Rect x={3} y={6} width={12} height={2} rx={1} fill={colorActual} />
      <Rect y={9} width={2} height={2} rx={1} fill={colorActual} />
      <Rect x={3} y={9} width={12} height={2} rx={1} fill={colorActual} />
    </Svg>
  );
};

export { ListDeco };
