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
import { SIDNoteType } from "@/constants/CommonTypes";
import { useDiaryData } from "@/stores/diary/diary";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
//@ts-ignore
import { debounce } from "lodash";
import { CopyDeco } from "@/components/deco/CopyDeco";
import * as Clipboard from "expo-clipboard";

function DiaryNoteView() {
  const selectedNote = useSelectedDiaryNote((store) => store.selectedNote);
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const diaryAPI = useDiaryData();
  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  const updateNoteImmediate = useCallback(
    (updatedNote: SIDNoteType) => {
      let chunkId = null;
      const chunkMapping = diaryAPI.noteChunkMapping;
      if (chunkMapping === null) {
        return;
      }
      const keys = Object.keys(chunkMapping);
      for (let ix = 0; ix < keys.length; ix++) {
        const key = keys[ix];
        const noteIdsInChunk = chunkMapping[key];
        if (noteIdsInChunk.includes(updatedNote.noteID)) {
          chunkId = key;
          break;
        }
      }

      const dataRetrivalAPI = dataRetrivalApi.getState();
      dataRetrivalAPI
        .modifyEntry(
          "personalDiaryChunks",
          ["noteID"],
          updatedNote.noteID,
          updatedNote,
          chunkId,
          "replace"
        )
        .then(() => {
          if (diaryAPI.notes === null) return;
          const updatedNotes = diaryAPI.notes.map((note) =>
            note.noteID === updatedNote.noteID ? updatedNote : note
          );
          diaryAPI.setNotes(updatedNotes);
        })
        .catch((error) => {
          console.error("Error updating note:", error);
        });
    },
    [diaryAPI.noteChunkMapping]
  );

  const updateNote = useCallback(debounce(updateNoteImmediate, 300), [
    updateNoteImmediate,
  ]);

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
              <View
                style={{
                  width: "100%",
                  flexGrow: 1,
                  maxHeight: "88%",
                }}
              >
                <TextInput
                  readOnly={selectedNote.metdata.readOnly}
                  onChange={(e) => {
                    const updatedNote = {
                      ...selectedNote,
                      metdata: {
                        ...selectedNote.metdata,
                        updatedAt: Date.now(),
                      },
                      content: e.nativeEvent.text,
                    };
                    updateNote(updatedNote);
                  }}
                  fontSize={17}
                  defaultValue={selectedNote?.content?.replace("\n", " ")}
                  textAlignVertical="top"
                  borderColor="#00000000"
                  backgroundColor={globalStyle.color + "10"}
                  multiline={true}
                  style={{
                    width: "100%",
                    flexGrow: 1,
                    zIndex: 3,
                    minHeight: 100,
                  }}
                ></TextInput>
                <Button
                  onClick={async () => {
                    const noteContent = selectedNote.content;
                    Clipboard.setStringAsync(noteContent);
                  }}
                  style={{
                    position: "absolute",
                    bottom: 5,
                    height: 45,
                    zIndex: 5,
                    width: 45,
                    right: 5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CopyDeco width={20} height={25}></CopyDeco>
                </Button>
              </View>
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
                onChange={(e) => {
                  const updatedNote = {
                    ...selectedNote,
                    metdata: {
                      ...selectedNote.metdata,
                      readOnly: e,
                    },
                  };
                  useSelectedDiaryNote.getState().setSelectedNote(updatedNote);
                  updateNote(updatedNote);
                }}
                label="Read Only"
              ></FeatureConfigBooleanInput>
              <FeatureConfigValueInput
                inputType="text"
                label="Title"
                value={selectedNote.metdata.title}
                onChange={(e) => {
                  const updatedNote = {
                    ...selectedNote,
                    metdata: {
                      ...selectedNote.metdata,
                      updatedAt: Date.now(),
                      title: e,
                    },
                  };
                  updateNote(updatedNote);
                }}
              ></FeatureConfigValueInput>
            </FeatureConfigEmptySettingPage>
          </>
        )}
      </ThemedView>
    </>
  );
}
export default DiaryNoteView;

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
