import { useGlobalStyleStore } from "@/stores/globalStyles";
import { View } from "react-native";
import { ARCLogo } from "../deco/ARCLogo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SimpleHeader() {
  const insets = useSafeAreaInsets();
  const globalStyles = useGlobalStyleStore((store) => store.globalStyle);
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        width: "120%",
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottomColor: globalStyles.color,
        borderBottomWidth: 1,
        paddingTop: 3,
        paddingBottom: 3,
      }}
    >
      <ARCLogo color={globalStyles.color}></ARCLogo>
    </View>
  );
}
export default SimpleHeader;
