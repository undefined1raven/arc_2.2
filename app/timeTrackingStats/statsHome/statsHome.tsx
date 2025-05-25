import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import KeyboardVisible from "@/components/functional/KeyboardStatus";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { StatusIndicators } from "@/components/ui/StatusIndicators";
import { ColorInput } from "@/components/common/ColorPicker";
function Home() {
  const navMenuApi = useNavMenuApi();

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <ColorInput color="#ffffff" onChange={() => {}}></ColorInput>
      </ThemedView>
    </>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
