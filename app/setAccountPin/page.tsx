import "react-native-get-random-values";
import { Link, router, Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
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
import { CheckBox } from "@/components/common/CheckBox";

export default function Main() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const newUserDataApi = useNewUserData();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      onPressIn={() => {
        Keyboard.dismiss();
      }}
    >
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
                    marginBottom: 100,
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
                    label="Set a PIN"
                    style={{
                      height: "100%",
                      width: "100%",
                      marginBottom: 5,
                      paddingLeft: 0,
                    }}
                  ></Text>
                </Animated.View>
                <Animated.View
                  entering={FadeIn}
                  style={{
                    width: "100%",
                    marginBottom: 5,
                    height: "8%",
                  }}
                >
                  <Text
                    textAlign="left"
                    fontSize={globalStyle.largeMobileFont}
                    label="You can use this pin to better protect your data as well as a recovery method"
                    style={{
                      height: "100%",
                      width: "100%",
                      marginBottom: 5,
                      paddingLeft: 0,
                    }}
                  ></Text>
                </Animated.View>
                <TextInput
                  textAlign="left"
                  secureTextEntry={true}
                  style={{ width: "100%", height: 50, marginBottom: 10 }}
                  keyboardType="numeric"
                ></TextInput>
                <TextInput
                  secureTextEntry={true}
                  textAlign="left"
                  style={{ width: "100%", height: 50, marginBottom: 10 }}
                  keyboardType="numeric"
                ></TextInput>
                <Animated.View
                  entering={FadeInDown}
                  style={{ height: "20%", width: "100%" }}
                >
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
                <Animated.View
                  style={{
                    width: "100%",
                    height: 60,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Animated.View
                    style={{
                      width: 50,
                      height: "90%",
                    }}
                  >
                    <CheckBox
                      checked={false}
                      checkedColor={globalStyle.color + "AA"}
                      uncheckedColor={globalStyle.color + "10"}
                      onChange={() => {}}
                      style={{ width: "100%", height: "100%" }}
                    ></CheckBox>
                  </Animated.View>
                  <Animated.View
                    style={{
                      flexGrow: 1,
                      height: "100%",
                    }}
                  >
                    <Text
                      textAlign="left"
                      label="Use biometric authentication"
                      style={{
                        height: "100%",
                        width: "100%",
                        marginBottom: 5,
                        paddingLeft: 10,
                      }}
                    ></Text>
                  </Animated.View>
                </Animated.View>
              </>
            )}
          </>
        </ThemedView>
      </>
    </TouchableWithoutFeedback>
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
