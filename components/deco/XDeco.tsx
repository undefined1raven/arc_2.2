import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
const XDeco = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={13}
      height={13}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        transform="rotate(-45 0 .707)"
        fill={colorActual}
        d="M0 0.707153H1V16.707153H0z"
      />
      <Path
        transform="rotate(45 11.314 0)"
        fill={colorActual}
        d="M11.3137 0H12.3137V16H11.3137z"
      />
    </Svg>
  );
};

export { XDeco };
