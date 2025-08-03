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
import { useMemo } from "react";
import * as Clipboard from "expo-clipboard";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();

  const textToSave = useMemo(() => {
    return (
      newUserDataApi.recoveryCodes.join(" , ") +
      `, 0.1.1, [do not share these with anyone and keep them in a safe place][account_id:${newUserDataApi.userData?.id}]`
    );
  }, [newUserDataApi.recoveryCodes, newUserDataApi.userData]);

  const recoveryCodeRenderItem = ({ item }: { item: string }) => {
    return (
      <Text
        fontSize={14}
        backgroundColor={globalStyle.color + "20"}
        style={{ width: "100%", marginBottom: 10, height: 50 }}
        label={item}
        textAlign="left"
      ></Text>
    );
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <>
          {newUserDataApi.isGeneratingKeysAndConfig ? (
            <>
              <View
                style={{
                  width: "70%",
                  height: "30%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ARCLogoMini style={{ height: 50, width: 50 }}></ARCLogoMini>
                <Text
                  style={{ marginTop: "5%" }}
                  label="Generating secure keys"
                ></Text>
                <ActivityIndicator
                  style={{ marginTop: "5%" }}
                  color={globalStyle.color}
                ></ActivityIndicator>
              </View>
            </>
          ) : (
            <>
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
                  label="One-time Setup [1/3]"
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
                  label="Recovery Codes"
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
                <FlatList
                  renderItem={recoveryCodeRenderItem}
                  data={newUserDataApi.recoveryCodes}
                ></FlatList>
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
                      saveFile(fileName, textToSave).then((res) => {
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
                      Clipboard.setStringAsync(textToSave);
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
                    router.push("/secretKey/page");
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
            </>
          )}
        </>
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
