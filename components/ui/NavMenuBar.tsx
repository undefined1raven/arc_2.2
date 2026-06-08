import { useGlobalStyleStore } from "@/stores/globalStyles";
import Animated from "react-native-reanimated";
import Button from "../common/Button";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { useRouter, usePathname, router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDiaryData } from "@/stores/diary/diary";
function NavMenuBar() {
  const menuApi = useNavMenuApi();
  const globalStyle = useGlobalStyleStore();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={{
        width: "100%",
        borderRadius: globalStyle.globalStyle.borderRadius,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        bottom: insets.bottom,
        height: 50,
        marginTop: 5,
        borderTopColor: globalStyle.globalStyle.colorAccent + "80",
        borderTopWidth: 1,
      }}
    >
      {menuApi.menuItems.map((menuItem, index) => (
        <Button
          key={index}
          onClick={() => {
            if (pathname === menuItem.pathname) {
              return;
            }
            if (menuItem.pathname === "/settings/settings") {
              saveFile();
              return;
            }
            router.push(menuItem.pathname);
          }}
          style={{
            width: "16.666%",
            height: "100%",
            borderColor: "#00000000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {menuItem.icon({
            color:
              menuItem.pathname === pathname
                ? globalStyle.globalStyle.color
                : globalStyle.globalStyle.color + "AA",
          })}
          <Animated.View
            style={{
              backgroundColor:
                menuItem.pathname === pathname
                  ? globalStyle.globalStyle.color
                  : globalStyle.globalStyle.color + "20",
              width: "65%",
              borderRadius: globalStyle.globalStyle.borderRadius,
              position: "absolute",
              height: 3,
              bottom: 0,
            }}
          ></Animated.View>
        </Button>
      ))}
    </Animated.View>
  );
}

export { NavMenuBar };
