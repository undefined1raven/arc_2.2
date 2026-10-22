import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetworkDeco from "../deco/NetworkDeco";
import { DownloadDeco } from "../deco/DownloadDeco";
import { PadlockIcon } from "../deco/PadlockIcon";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useStatusIndicatorStore } from "@/stores/statusIndicatorStore";
import { ArrowDeco } from "../deco/ArrowDeco";

function StatusIndicators() {
  const insets = useSafeAreaInsets();
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);

  const {
    isSavingLocalData,
    isUploadingToRemoteStorage,
    isDownloadingFromRemoteStorage,
  } = useStatusIndicatorStore();

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top,
        width: "100%",
        height: 25,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 5,
      }}
    >
      {isSavingLocalData && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={LinearTransition}
          style={{
            height: "100%",
            backgroundColor: globalStyle.color + "50",
            borderRadius: 5,
            display: "flex",
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
            paddingLeft: 3,
            paddingRight: 3,
            width: 50,
          }}
        >
          <PadlockIcon height={15} width={15} />
          <ActivityIndicator size="small" color={globalStyle.color} />
        </Animated.View>
      )}
      {(isUploadingToRemoteStorage || isDownloadingFromRemoteStorage) && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={LinearTransition}
          style={{
            height: "100%",
            backgroundColor: globalStyle.color + "50",
            borderRadius: 5,
            display: "flex",
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 3,
            paddingRight: 3,
            width: 50,
          }}
        >
          <NetworkDeco color={globalStyle.color} height={20} width={20} />
        </Animated.View>
      )}
    </View>
  );
}

export { StatusIndicators };
