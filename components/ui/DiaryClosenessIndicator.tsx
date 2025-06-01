import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback, useEffect, useState } from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

function DiaryClosenessIndicator(
  props: { closeness: number } & Partial<SVGStyleElement> & {
      width?: number;
      height?: number;
    }
) {
  const [cleanedProps, setCleanedProps] = useState(props);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  useEffect(() => {
    const { closeness, ...rest } = props;
    //@ts-ignore
    setCleanedProps(rest);
  }, [props]);

  const getRingOpacity = useCallback(
    (closeness: number, index: number) => {
      if (closeness === index) {
        return 1;
      } else {
        return 0.2;
      }
    },
    [props.closeness]
  );

  return (
    <Svg
      width={props.width ? props.width : 40}
      height={props.height ? props.height : 40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...cleanedProps}
    >
      <G stroke={globalStyle.color}>
        <G strokeOpacity={0.1} strokeWidth={0.444444} strokeDasharray="2 2">
          <Path d="M0.222222 19.7776H39.777822V20.222044H0.222222z" />
          <Path
            transform="rotate(-90 19.778 39.778)"
            d="M19.7778 39.7778H59.3334V40.222243999999996H19.7778z"
          />
        </G>
        <Circle
          cx={20}
          cy={19.9999}
          color={globalStyle.color}
          r={4.2619}
          strokeOpacity={getRingOpacity(props.closeness, 0)}
        />
        <Circle
          cx={20}
          strokeOpacity={getRingOpacity(props.closeness, 1)}
          cy={19.9999}
          color={globalStyle.color}
          r={8.07143}
        />
        <Circle
          cx={20}
          cy={20.0001}
          color={globalStyle.color}
          r={11.881}
          strokeOpacity={getRingOpacity(props.closeness, 2)}
        />
        <Circle
          cx={20}
          cy={19.9998}
          color={globalStyle.color}
          r={15.6905}
          strokeOpacity={getRingOpacity(props.closeness, 3)}
        />
        <Circle
          cx={20}
          cy={20}
          color={globalStyle.color}
          r={19.5}
          strokeOpacity={getRingOpacity(props.closeness, 4)}
        />
      </G>
    </Svg>
  );
}

export { DiaryClosenessIndicator };
