// components/functional/CriticalSyncOverlay.tsx
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Portal } from "react-native-portalize";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Text from "@/components/common/Text";
import { SimpleDonutChart } from "@/components/common/SimpleDonutChart";
import { useCallback } from "react";

export function CriticalSyncOverlay() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);

  // return (
  //   <Portal>
  //     <ThemedView
  //       keyboardDismissMode={false}
  //       style={{ ...styles.container, height: "100%" }}
  //     >
  //       <View style={{ width: "100%", height: 50 }}>
  //         <Text
  //           label="Downloading user data"
  //           fontSize={globalStyle.largeMobileFont}
  //         ></Text>
  //       </View>
  //       <View
  //         style={{
  //           width: "100%",
  //           alignItems: "center",
  //           display: "flex",
  //           flexDirection: "column",
  //           gap: 20,
  //         }}
  //       >
  //         <SimpleDonutChart
  //           max={100}
  //           min={0}
  //           style={{ width: 75, height: 75 }}
  //           value={0}
  //           thickness={2}
  //           color={globalStyle.color}
  //           backgroundColor={globalStyle.color + "20"}
  //         ></SimpleDonutChart>
  //         <Text
  //           color={globalStyle.textColorAccent}
  //           label="0%"
  //           fontSize={globalStyle.largeMobileFont}
  //         ></Text>
  //       </View>
  //     </ThemedView>
  //   </Portal>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
