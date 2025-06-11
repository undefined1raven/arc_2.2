import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback, useEffect, useState } from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

function RingSelector(
  props: {
    closeness: number;
    onRingChange: (ring: number) => void;
  } & Partial<SVGStyleElement> & {
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
        return {
          opacity: 0.1,
          borderColor: globalStyle.color,
          labelColor: globalStyle.color,
          strokeOpacity: 1,
          strokeColor: globalStyle.color,
          fillColor: globalStyle.color,
        };
      } else {
        return {
          opacity: 0,
          borderColor: globalStyle.colorInactive,
          labelColor: globalStyle.colorInactive,
          strokeOpacity: 1,
          strokeColor: globalStyle.colorAccent,
          fillColor: globalStyle.colorInactive,
        };
      }
    },
    [props.closeness]
  );

  return (
    <Svg
      width={150}
      height={112}
      viewBox="0 0 150 112"
      fill="none"
      xmlns="http://www.w3.org/4000/svg"
      pointerEvents="box-none"
      {...cleanedProps}
    >
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(1);
          }
        }}
        d="M14.281 4.25h27.407l13.705 23.736L41.688 51.72H14.281L.576 27.986 14.281 4.25z"
        stroke={getRingOpacity(props.closeness, 1).strokeColor}
        fillOpacity={getRingOpacity(props.closeness, 1).opacity}
        strokeOpacity={getRingOpacity(props.closeness, 1).strokeOpacity}
        fill={getRingOpacity(props.closeness, 1).fillColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(1);
          }
        }}
        d="M14.281 4.25h27.407l13.705 23.736L41.688 51.72H14.281L.576 27.986 14.281 4.25z"
        strokeWidth={40}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(1);
          }
        }}
        d="M24.33 32v-.854h2.478v-7.952h-1.946v-.434l.546-.42h2.324v8.806h2.254V32H24.33z"
        fill={getRingOpacity(props.closeness, 1).labelColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(0);
          }
        }}
        d="M61.281 32.28H88.69l13.704 23.736L88.689 79.75H61.28L47.576 56.016 61.281 32.28z"
        stroke={getRingOpacity(props.closeness, 0).strokeColor}
        fillOpacity={getRingOpacity(props.closeness, 0).opacity}
        strokeOpacity={getRingOpacity(props.closeness, 0).strokeOpacity}
        fill={getRingOpacity(props.closeness, 0).fillColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(0);
          }
        }}
        d="M61.281 32.28H88.69l13.704 23.736L88.689 79.75H61.28L47.576 56.016 61.281 32.28z"
        strokeWidth={40}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(0);
          }
        }}
        d="M71.938 57.914v-5.488c0-1.39.695-2.086 2.086-2.086h2.044c1.39 0 2.086.696 2.086 2.086v5.488c0 1.39-.695 2.086-2.086 2.086h-2.044c-1.39 0-2.086-.695-2.086-2.086zm.938.14c0 .728.369 1.092 1.106 1.092h2.128c.737 0 1.106-.364 1.106-1.092v-5.768c0-.728-.369-1.092-1.106-1.092h-2.128c-.737 0-1.106.364-1.106 1.092v5.768z"
        fill={getRingOpacity(props.closeness, 0).labelColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(2);
          }
        }}
        d="M108.281 4.28h27.407l13.705 23.736-13.705 23.735h-27.407L94.576 28.016 108.281 4.28z"
        stroke={getRingOpacity(props.closeness, 2).strokeColor}
        fillOpacity={getRingOpacity(props.closeness, 2).opacity}
        strokeOpacity={getRingOpacity(props.closeness, 2).strokeOpacity}
        fill={getRingOpacity(props.closeness, 2).fillColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(2);
          }
        }}
        d="M108.281 4.28h27.407l13.705 23.736-13.705 23.735h-27.407L94.576 28.016 108.281 4.28z"
        strokeWidth={40}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(2);
          }
        }}
        d="M118.938 32v-2.884c0-1.138.499-1.81 1.498-2.016l2.954-.588c.551-.112.826-.471.826-1.078v-1.148c0-.728-.369-1.092-1.106-1.092h-3.892v-.434l.546-.42h3.304c1.391 0 2.086.696 2.086 2.086v.91c0 1.139-.499 1.81-1.498 2.016l-2.954.588c-.551.112-.826.472-.826 1.078v2.128h5.278V32h-6.216z"
        fill={getRingOpacity(props.closeness, 2).labelColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(3);
          }
        }}
        d="M108.281 60.28h27.407l13.705 23.736-13.705 23.735h-27.407L94.576 84.016l13.705-23.737z"
        stroke={getRingOpacity(props.closeness, 3).strokeColor}
        fillOpacity={getRingOpacity(props.closeness, 3).opacity}
        strokeOpacity={getRingOpacity(props.closeness, 3).strokeOpacity}
        fill={getRingOpacity(props.closeness, 3).fillColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(3);
          }
        }}
        d="M108.281 60.28h27.407l13.705 23.736-13.705 23.735h-27.407L94.576 84.016l13.705-23.737z"
        strokeWidth={40}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(3);
          }
        }}
        d="M119.078 87.58v-.434h4.032c.737 0 1.106-.364 1.106-1.092V84.43c0-.737-.369-1.106-1.106-1.106h-2.996v-.84h2.996c.737 0 1.106-.368 1.106-1.106v-1.092c0-.728-.369-1.092-1.106-1.092h-3.892v-.434l.546-.42h3.304c1.391 0 2.086.696 2.086 2.086v1.05c0 .374-.117.677-.35.91l-.49.49.49.49c.233.234.35.537.35.91v1.638c0 1.39-.695 2.086-2.086 2.086h-3.444l-.546-.42z"
        fill={getRingOpacity(props.closeness, 3).labelColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(4);
          }
        }}
        d="M14.281 60.28h27.407l13.705 23.736-13.705 23.735H14.281L.576 84.016l13.705-23.737z"
        stroke={getRingOpacity(props.closeness, 4).strokeColor}
        fillOpacity={getRingOpacity(props.closeness, 4).opacity}
        strokeOpacity={getRingOpacity(props.closeness, 4).strokeOpacity}
        fill={getRingOpacity(props.closeness, 4).fillColor}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(4);
          }
        }}
        d="M14.281 60.28h27.407l13.705 23.736-13.705 23.735H14.281L.576 84.016l13.705-23.737z"
        strokeWidth={40}
      />
      <Path
        pointerEvents="auto"
        onPress={() => {
          if (typeof props.onRingChange === "function") {
            props.onRingChange(4);
          }
        }}
        d="M23.938 86.082v-.77l3.318-6.972h.77l.126.238-3.178 6.664h4.242V81.98h.938V88h-.938v-1.918h-5.278z"
        fill={getRingOpacity(props.closeness, 4).labelColor}
      />
    </Svg>
  );
}

export { RingSelector };
