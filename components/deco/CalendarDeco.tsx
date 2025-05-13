import { useGlobalStyleStore } from "@/stores/globalStyles";
import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function CalendarDeco(props: SvgProps) {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const colorActual = props.color ? props.color : globalStyle.color;

  return (
    <Svg
      width={20}
      height={25}
      viewBox="0 0 20 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M1 .5h10.634a.5.5 0 01.277.084l.076.062 7.081 7.082a.5.5 0 01.147.353v15.016a.5.5 0 01-.5.5H1a.5.5 0 01-.5-.5V1A.5.5 0 011 .5z"
        fill={colorActual}
        fillOpacity={0.2}
        stroke={colorActual}
      />
      <Path
        d="M6.768 15.164v-1.332c0-.32.1-.58.3-.78l.42-.42-.42-.42c-.2-.2-.3-.46-.3-.78v-.876c0-1.224.612-1.836 1.836-1.836h1.728c1.224 0 1.836.612 1.836 1.836v.876c0 .32-.1.58-.3.78l-.42.42.42.42c.2.2.3.46.3.78v1.332c0 1.224-.612 1.836-1.836 1.836H8.604c-1.224 0-1.836-.612-1.836-1.836zm1.008.108c0 .544.272.816.816.816h1.752c.544 0 .816-.272.816-.816v-1.344c0-.544-.272-.816-.816-.816H8.592c-.544 0-.816.272-.816.816v1.344zm0-3.888c0 .544.272.816.816.816h1.752c.544 0 .816-.272.816-.816v-.936c0-.544-.272-.816-.816-.816H8.592c-.544 0-.816.272-.816.816v.936z"
        fill={colorActual}
      />
    </Svg>
  );
}

export default CalendarDeco;
