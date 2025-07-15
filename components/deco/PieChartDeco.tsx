import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
const PieChartDeco = (props: SvgProps) => {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M28 14A14 14 0 004.1 4.1l2.143 2.143A10.97 10.97 0 0124.97 14H28zM2.298 6.315a14 14 0 00-.86 13.865l2.72-1.338A10.97 10.97 0 014.83 7.978L2.298 6.315zM2.844 22.459a14 14 0 006.94 4.891l.912-2.89a10.97 10.97 0 01-5.437-3.832l-2.415 1.83zM12.21 27.885a14 14 0 0015.532-11.212l-2.974-.578a10.97 10.97 0 01-12.17 8.784l-.388 3.006z"
        fill={colorActual}
      />
    </Svg>
  );
};

export { PieChartDeco };
