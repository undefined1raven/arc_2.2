import Button from "@/components/common/Button";
import Text from "@/components/common/Text";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function BottomMenu(props: {
  onNextButton: Function;
  onBackButton?: Function | undefined;
  canGoForward?: boolean | undefined;
}) {
  const bottomInset = useSafeAreaInsets().bottom;
  const globalStyle = useGlobalStyleStore((r) => r.globalStyle);

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomInset,
        width: "100%",
        height: 50,
        display: "flex",
        flexDirection: "row",
        marginLeft: 10,
        marginRight: 10,
        justifyContent: "space-between",
      }}
    >
      <Button
        onClick={() => {
          if (typeof props.onBackButton === "function") {
            props.onBackButton();
          } else {
            router.push("/");
          }
        }}
        style={{
          height: "100%",
          width: "50%",
          display: "flex",
          alignItems: "center",
          borderWidth: 0,
          justifyContent: "center",
          borderRightWidth: 1,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Text label="Cancel"></Text>
      </Button>
      <Button
        onClick={() => {
          props.onNextButton();
        }}
        style={{
          height: "100%",
          width: "50%",
          borderWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowDeco
          color={
            props.canGoForward ? globalStyle.color : globalStyle.colorInactive
          }
          height={35}
        ></ArrowDeco>
      </Button>
    </View>
  );
}

export { BottomMenu };
