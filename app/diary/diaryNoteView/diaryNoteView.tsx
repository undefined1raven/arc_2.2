import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useSelectedDiaryNote } from "@/stores/viewState/diarySelectedNote";
import Animated, { FadeInDown } from "react-native-reanimated";
import { layoutAnimationsDuration } from "@/constants/animations";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import {
  ANDROID_RIPPLE_TRANSPARENCY,
  layoutCardLikeBackgroundOpacity,
} from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback, useEffect } from "react";
import Text from "@/components/common/Text";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { FeatureConfigBooleanInput } from "@/components/ui/FeatureConfigBooleanInput copy";
import TextInput from "@/components/common/TextInput";
function Home() {
  const selectedNote = useSelectedDiaryNote((store) => store.selectedNote);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  const getDisplayDate = useCallback((date: number) => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const threeLetterMonth = parsedDate.toLocaleString("default", {
      month: "short",
    });
    const day = parsedDate.getDate();
    const time = parsedDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${threeLetterMonth} ${year} | ${time}`;
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {selectedNote === null ? (
          <ActivityIndicator color={"#000000"}></ActivityIndicator>
        ) : (
          <>
            <FeatureConfigEmptySettingPage
              bototmHeaderLabel={`Edit Note`}
              bottomHeaderButtonOnPress={() => {
                router.back();
              }}
            >
              <TextInput
                fontSize={17}
                defaultValue={selectedNote?.content?.replace("\n", " ")}
                textAlignVertical="top"
                borderColor="#00000000"
                backgroundColor={globalStyle.color + "10"}
                multiline={true}
                style={{
                  width: "100%",
                  flexGrow: 1,
                  maxHeight: "88%",
                }}
              ></TextInput>
              <View
                style={{
                  height: 60,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  paddingRight: 10,
                  paddingLeft: 10,
                  borderRadius: globalStyle.borderRadius,
                  backgroundColor:
                    globalStyle.color + layoutCardLikeBackgroundOpacity,
                }}
              >
                <View
                  style={{
                    width: "50%",
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    borderRadius: globalStyle.borderRadius,
                  }}
                >
                  <Text
                    color={globalStyle.textColorAccent}
                    fontSize={globalStyle.mediumMobileFont}
                    label="Created at"
                  ></Text>
                  <Text
                    color={globalStyle.textColorAccent}
                    fontSize={globalStyle.mediumMobileFont}
                    label={getDisplayDate(selectedNote.metdata.createdAt)}
                  ></Text>
                </View>
                <View
                  style={{
                    width: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    borderRadius: globalStyle.borderRadius,
                  }}
                >
                  <Text
                    color={globalStyle.textColorAccent}
                    fontSize={globalStyle.mediumMobileFont}
                    label="Updated at"
                  ></Text>
                  <Text
                    color={globalStyle.textColorAccent}
                    fontSize={globalStyle.mediumMobileFont}
                    label={getDisplayDate(selectedNote.metdata.updatedAt)}
                  ></Text>
                </View>
              </View>
              <FeatureConfigBooleanInput
                value={selectedNote.metdata.readOnly}
                onChange={(e) => {}}
                label="Read Only"
              ></FeatureConfigBooleanInput>
              <FeatureConfigValueInput
                inputType="text"
                label="Title"
                value={selectedNote.metdata.title}
                onChange={(e) => {}}
              ></FeatureConfigValueInput>
            </FeatureConfigEmptySettingPage>
          </>
        )}
      </ThemedView>
    </>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
