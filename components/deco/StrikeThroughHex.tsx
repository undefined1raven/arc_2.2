import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
const StrikeThroughHex = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M14.428 4.288v7.423L8 15.423 1.572 11.71V4.288L8 .576l6.428 3.712z"
        stroke={colorActual}
      />
      <Path
        transform="rotate(-33.265 4 2.549)"
        fill={colorActual}
        d="M4 2.54858H5V15.721779999999999H4z"
      />
    </Svg>
  );
};

export { StrikeThroughHex };
