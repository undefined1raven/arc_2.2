import { ActivityIndicator, StyleSheet } from "react-native";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ThemedView } from "@/components/ThemedView";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";

function Home() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini style={{ width: 60, height: 60 }}></ARCLogoMini>
      </ThemedView>
    </>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
