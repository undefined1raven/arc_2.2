import { useGlobalStyleStore } from "@/stores/globalStyles";
import Svg, { Rect, SvgProps } from "react-native-svg";

function Dropdown(props: SvgProps) {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  return (
    <Svg
      width={35}
      height={18}
      viewBox="0 0 35 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        y={0.868286}
        width={1}
        height={23.9414}
        rx={0.5}
        transform="rotate(-45 0 .868)"
        fill={globalStyle.color}
      />
      <Rect
        x={33.3094}
        width={1}
        height={24}
        rx={0.5}
        transform="rotate(45 33.31 0)"
        fill={globalStyle.color}
      />
    </Svg>
  );
}

export { Dropdown };
