import React, { useEffect, useState } from "react";
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
import { rangeScaler } from "@/components/utils/RangeScaler";

type TimeTrackingVisualizationProps = {
  renderWidth: number;
  activityStartTime: number;
};

const TimeTrackingVisualization = ({
  renderWidth,
  activityStartTime,
}: TimeTrackingVisualizationProps) => {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const path = Skia.Path.Make();
  const [currentTimeWidth, setCurrentTimeWidth] = useState(0);
  const [activityStartTimeXCoord, setActivityStartTimeXCoord] = useState(0);
  const [activityDurationWidth, setActivityDurationWidth] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const elapsedTime = Date.now() - activityStartTime;
      const elapsedTimeWidth = Math.floor(
        rangeScaler(elapsedTime, 0, 86400000, 0, renderWidth)
      );
      const startOfTodayUnix = startOfToday.getTime();
      const elapsedTime2 = activityStartTime - startOfTodayUnix;
      const elapsedTimeWidth2 = Math.floor(
        rangeScaler(elapsedTime2, 0, 86400000, 0, renderWidth)
      );
      setCurrentTimeWidth(elapsedTimeWidth2);
      setActivityDurationWidth(elapsedTimeWidth);
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, [activityDurationWidth]);

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayUnix = startOfToday.getTime();
    const elapsedTime = activityStartTime - startOfTodayUnix;
    const elapsedTimeWidth = Math.floor(
      rangeScaler(elapsedTime, 0, 86400000, 0, renderWidth)
    );
    setActivityStartTimeXCoord(elapsedTimeWidth);
  }, [activityStartTime]);

  return (
    <Canvas style={{ flex: 1 }}>
      <RoundedRect
        x={0}
        y={3}
        width={renderWidth}
        height={15}
        r={globalStyle.borderRadius}
        color={globalStyle.color + "20"}
      />
      <RoundedRect
        rect={{
          rect: { x: 0, y: 3, width: currentTimeWidth, height: 15 },
          topRight: { x: 0, y: 0 },
          topLeft: {
            x: globalStyle.borderRadius,
            y: globalStyle.borderRadius,
          },
          bottomLeft: {
            x: globalStyle.borderRadius,
            y: globalStyle.borderRadius,
          },
          bottomRight: { x: 0, y: 0 },
        }}
        color={globalStyle.colorAltLight}
      />

      <RoundedRect
        x={activityStartTimeXCoord}
        y={0}
        r={globalStyle.borderRadius}
        width={3}
        height={21}
        color={globalStyle.color}
      />
      <RoundedRect
        rect={{
          rect: {
            x: activityStartTimeXCoord,
            y: 3,
            width: activityDurationWidth,
            height: 15,
          },
          topLeft: { x: 0, y: 0 },
          topRight: {
            x: globalStyle.borderRadius,
            y: globalStyle.borderRadius,
          },
          bottomRight: {
            x: globalStyle.borderRadius,
            y: globalStyle.borderRadius,
          },
          bottomLeft: { x: 0, y: 0 },
        }}
        r={globalStyle.borderRadius}
        color={globalStyle.color}
      />
      {[1, 2, 3].map((i, index) => (
        <Rect
          key={i}
          x={(renderWidth / 4) * i}
          y={3}
          width={1}
          height={15}
          color={globalStyle.color + "40"}
        />
      ))}
    </Canvas>
  );
};

export default TimeTrackingVisualization;
