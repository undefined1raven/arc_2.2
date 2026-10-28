import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function NetworkDeco(props?: SvgProps) {
  const globalStyle = useGlobalStyleStore().globalStyle;

  return (
    <Svg width={10} height={13} viewBox="0 0 10 13" fill="none" {...props}>
      <Path
        d="M4 12.293V.5a.5.5 0 00-1 0V9a.828.828 0 01-1.414.586L1.5 9.5a.707.707 0 00-1 1l2.293 2.293a.707.707 0 001.207-.5zM6 .707V12.5a.5.5 0 001 0V4a.828.828 0 011.414-.586L8.5 3.5a.707.707 0 001-1L7.207.207A.707.707 0 006 .707z"
        fill={props?.color ? props.color : globalStyle.color}
      />
    </Svg>
  );
}

export default NetworkDeco;
