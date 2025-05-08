import { useGlobalStyleStore } from "@/stores/globalStyles";
import Animated from "react-native-reanimated";
import Button from "../common/Button";
import { useNavMenuApi } from "@/stores/navMenuApi";

function NavMenuBar() {
  const menuApi = useNavMenuApi();
  const globalStyle = useGlobalStyleStore();
  return (
    <Animated.View
      style={{
        backgroundColor: globalStyle.globalStyle.color + "20",
        width: "100%",
        borderRadius: globalStyle.globalStyle.borderRadius,
        height: "6%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {menuApi.menuItems.map((menuItem, index) => (
        <Button
          key={index}
          onClick={() => {}}
          style={{
            width: "20%",
            height: "100%",
            borderColor: "#00000000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {menuItem.icon({})}
          <Animated.View
            style={{
              backgroundColor: globalStyle.globalStyle.color,
              width: "65%",
              borderRadius: globalStyle.globalStyle.borderRadius,
              position: "absolute",
              height: 3,
              bottom: 2,
            }}
          ></Animated.View>
        </Button>
      ))}
    </Animated.View>
  );
}

export { NavMenuBar };
