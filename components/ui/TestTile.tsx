import React, { useEffect, useState } from "react";
import { View, Text, PanResponder, Animated } from "react-native";

export const TestTile = () => {
  const [activeView, setActiveView] = useState(0);
  const pan = React.useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    console.log("Rendering TestTile with activeView:", activeView, pan.x);
  }, [activeView, pan]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log("PanResponder activated");
        return true;
      },
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, { vx, dx }) => {
        console.log("Released with velocity:", vx, "and distance:", dx);
        const threshold = 5;
        let nextView = activeView;

        if (dx < -threshold) {
          nextView = activeView + 1;
        } else if (dx > threshold) {
          nextView = activeView - 1;
        }

        setActiveView(nextView);
        Animated.spring(pan, {
          toValue: { x: nextView * 100, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return (
    <View {...panResponder.panHandlers} style={{ width: "100%", height: 300 }}>
      <Animated.View
        style={[
          {
            width: "100%",
            height: 300,
            flexDirection: "row",
          },
          { transform: [{ translateX: pan.x }] },
        ]}
      >
        {[1, 2, 3].map((num) => (
          <View
            key={num}
            style={{
              width: "100%",
              height: 300,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: `hsl(${num * 120}, 70%, 60%)`,
            }}
          >
            <Text style={{ fontSize: 48, fontWeight: "bold", color: "white" }}>
              {num}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};
