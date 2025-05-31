import { Canvas, Path, Circle } from "@shopify/react-native-skia";
import { ViewStyle } from "react-native";

type SimpleDonutChartProps = {
  value: number;
  min: number;
  max: number;
  style?: ViewStyle;
  backgroundColor?: string;
  color?: string;
  thickness?: number;
};
function SimpleDonutChart({
  value = 20,
  min = 0,
  max = 100,
  style = {},
  backgroundColor = "#e0e0e0",
  color = "#3f51b5",
  thickness = 10,
}: SimpleDonutChartProps): React.JSX.Element | null {
  // Use container dimensions instead of hardcoded size
  const containerStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : style;
  const size = Math.min(
    typeof containerStyle?.width === "number" ? containerStyle.width : 100,
    typeof containerStyle?.height === "number" ? containerStyle.height : 100
  );
  const center = size / 2;
  const radius = center - thickness / 2;

  // Handle edge case when min equals max
  if (value === max) {
    return (
      <Canvas style={[{ width: size, height: size }, style]}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={thickness}
          color={color}
        />
      </Canvas>
    );
  }

  // Calculate the percentage and angle
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = percentage * 360;

  // Create path for the arc
  const createArcPath = (startAngle: number, endAngle: number) => {
    const startX =
      center + radius * Math.cos(((startAngle - 90) * Math.PI) / 180);
    const startY =
      center + radius * Math.sin(((startAngle - 90) * Math.PI) / 180);
    const endX = center + radius * Math.cos(((endAngle - 90) * Math.PI) / 180);
    const endY = center + radius * Math.sin(((endAngle - 90) * Math.PI) / 180);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  };

  return (
    <Canvas style={[{ width: size, height: size }, style]}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        style="stroke"
        strokeWidth={thickness}
        color={backgroundColor}
      />
      {angle > 0 && (
        <Path
          path={createArcPath(0, angle)}
          style="stroke"
          strokeWidth={thickness}
          strokeCap="round"
          color={color}
        />
      )}
    </Canvas>
  );
}

export { SimpleDonutChart };
