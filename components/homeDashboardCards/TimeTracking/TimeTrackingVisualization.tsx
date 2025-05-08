import React from "react";
import {
  Canvas,
  Paint,
  Rect,
  RoundedRect,
  Skia,
  Text,
  TextPath,
} from "@shopify/react-native-skia";
import { useGlobalStyleStore } from "@/stores/globalStyles";

type TimeTrackingVisualizationProps = {
  renderWidth: number;
};

const TimeTrackingVisualization = ({
  renderWidth,
}: TimeTrackingVisualizationProps) => {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const path = Skia.Path.Make();
  return (
    <Canvas style={{ flex: 1 }}>
      <RoundedRect
        x={0}
        y={0}
        width={renderWidth}
        height={30}
        r={globalStyle.borderRadius}
        color={globalStyle.color + "20"}
      />
      {[1, 2, 3].map((i, index) => (
        <Rect
          key={i}
          x={(renderWidth / 4) * i}
          y={0}
          width={2}
          height={30}
          color={"#fff"}
        />
      ))}
    </Canvas>
  );
};

export default TimeTrackingVisualization;
