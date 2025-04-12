import { ActivityIndicator, StyleSheet } from "react-native";
import { ARCLogoMini } from "../deco/ARCLogoMini";
import { ThemedView } from "../ThemedView";
import { useGlobalStyleStore } from "@/stores/globalStyles";

function SimpleLoadingScreen() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini style={{ width: 60, height: 60 }}></ARCLogoMini>
        <ActivityIndicator
          style={{ marginTop: "5%" }}
          color={globalStyle.color}
        ></ActivityIndicator>
      </ThemedView>
    </>
  );
}
export default SimpleLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
