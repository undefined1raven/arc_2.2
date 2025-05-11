import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NetworkDeco } from "../deco/NetworkDeco";
import { DownloadDeco } from "../deco/DownloadDeco";
import { PadlockIcon } from "../deco/PadlockIcon";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useStatusIndicatorStore } from "@/stores/statusIndicatorStore";

function StatusIndicators() {
  const insets = useSafeAreaInsets();
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const isSavingData = useStatusIndicatorStore();
  return (
    <View
      style={{
        position: "absolute",
        top: insets.top,
        width: "100%",
        height: 25,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {isSavingData.isSavingLocalData ? (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            width: 50,
            height: "100%",
            backgroundColor: globalStyle.color + "50",
            borderRadius: 5,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PadlockIcon height={15} width={15}></PadlockIcon>
          <ActivityIndicator
            size={"small"}
            color={globalStyle.color}
          ></ActivityIndicator>
        </Animated.View>
      ) : (
        <View></View>
      )}
      {/* <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
          height: "100%",
        }}
      >
        <View
          style={{
            width: 40,
            height: "100%",
            backgroundColor: globalStyle.successColor + "50",
            borderRadius: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NetworkDeco color={globalStyle.successColor}></NetworkDeco>
        </View>
        <View
          style={{
            width: 40,
            height: "100%",
            backgroundColor: globalStyle.successColor + "50",
            borderRadius: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator></ActivityIndicator>
        </View>
      </View> */}
    </View>
  );
}

export { StatusIndicators };
