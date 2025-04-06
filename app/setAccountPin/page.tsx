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
import TextInput from "@/components/common/TextInput";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();

  const recoveryCodeRenderItem = ({ item }: { item: string }) => {
    return (
      <Text
        fontSize={16}
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
          <SimpleHeader></SimpleHeader>
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
                  label="One-time Setup [2/2]"
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
                  label="Account PIN"
                  style={{
                    height: "100%",
                    width: "100%",
                    marginBottom: 5,
                    paddingLeft: 0,
                  }}
                ></Text>
              </Animated.View>
              <TextInput
                style={{ width: "100%", height: 100 }}
                keyboardType="visible-password"
              ></TextInput>
              <Button
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
