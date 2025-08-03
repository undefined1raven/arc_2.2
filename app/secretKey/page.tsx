import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/common/Button";
import { ARCLogo } from "@/components/deco/ARCLogo";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useNewUserData } from "@/stores/newUserData";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import * as Clipboard from "expo-clipboard";
import Text from "@/components/common/Text";
import SimpleHeader from "@/components/common/SimpleHeader";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { DownloadDeco } from "@/components/deco/DownloadDeco";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { saveFile } from "@/components/utils/fn/saveFile";
import { CopyDeco } from "@/components/deco/CopyDeco";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();

  return (
    <>
      <ThemedView style={styles.container}>
        <Animated.View
          entering={FadeIn}
          style={{
            width: "100%",
            marginBottom: 20,
            height: 50,
          }}
        >
          <Text
            textAlign="left"
            label="One-time Setup [2/3]"
            style={{
              height: "100%",
              width: "100%",
              marginBottom: 10,
            }}
            backgroundColor={globalStyle.color + "20"}
          ></Text>
        </Animated.View>
        <Animated.View
          entering={FadeIn}
          style={{
            width: "100%",
            marginBottom: 5,
            height: 50,
          }}
        >
          <Text
            textAlign="left"
            fontSize={globalStyle.veryLargeMobileFont}
            label="Secret Key"
            style={{
              height: "100%",
              width: "100%",
              marginBottom: 5,
              paddingLeft: 0,
            }}
          ></Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp}
          style={{ height: "60%", width: "100%" }}
        >
          <Text
            numberOfLines={10}
            fontSize={14}
            backgroundColor={globalStyle.color + "20"}
            style={{
              width: "100%",
              height: "auto",
              padding: 10,
              paddingRight: 15,
            }}
            label={newUserDataApi.secretKey || "."}
            textAlign="left"
          ></Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown}
          style={{ height: "20%", width: "100%" }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: "35%",
              marginBottom: 10,
            }}
          >
            <Button
              onClick={() => {
                const fileName = `ARCRecoveryCodes-${Date.now()}-${
                  newUserDataApi.userData?.id
                }.txt`;
                saveFile(fileName, newUserDataApi.secretKey).then((res) => {
                  console.log("File saved", res);
                });
              }}
              textAlign="left"
              label="Download"
              style={{
                flex: 1,
                height: "100%",
                marginRight: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <DownloadDeco style={{ height: 45 }}></DownloadDeco>
            </Button>
            <Button
              onClick={() => {
                Clipboard.setStringAsync(newUserDataApi.secretKey);
              }}
              textAlign="left"
              label=""
              style={{
                flex: 1,
                height: "100%",
                marginLeft: 5,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingRight: 5,
                paddingLeft: 5,
              }}
            >
              <Text label="Copy"></Text>
              <CopyDeco style={{ height: 45 }}></CopyDeco>
            </Button>
          </View>
          <Button
            onClick={() => {
              router.push("/setAccountPin/page");
            }}
            textAlign="left"
            label="Continue"
            textStyle={{ paddingLeft: 7 }}
            style={{
              width: "100%",
              height: "35%",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingRight: 5,
            }}
          >
            <ArrowDeco width={55}></ArrowDeco>
          </Button>
        </Animated.View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: "auto",
    paddingBottom: "auto",
  },
});
