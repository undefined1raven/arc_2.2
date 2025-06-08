import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useState } from "react";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useDiaryData } from "@/stores/diary/diary";
import { SIDGroupType, SIDNoteType } from "@/constants/CommonTypes";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { DiaryClosenessIndicator } from "@/components/ui/DiaryClosenessIndicator";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import Button from "@/components/common/Button";
import { layoutAnimationsDuration } from "@/constants/animations";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import Text from "@/components/common/Text";
import { useSelectedDiaryGroup } from "@/stores/viewState/diarySelectedGroup";
import { AddIcon } from "@/components/deco/AddIcon";
import { ANDROID_RIPPLE_TRANSPARENCY } from "@/constants/colors";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { router } from "expo-router";
import { SettingdIcon } from "@/components/deco/SettingsIcon";
import { v4 } from "uuid";
import { personalDiaryNotes } from "@/components/utils/constants/chunking";
import { useSelectedDiaryNote } from "@/stores/viewState/diarySelectedNote";
import { TrashIcon } from "@/components/deco/TrashIcon";
import { EditDeco } from "@/components/deco/EditDeco";
function DiaryGroupMain() {
  const diaryApi = useDiaryData();
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const personalDiaryFeatureConfig = useFeatureConfigs(
    (store) => store.personalDiaryFeatureConfig
  );
  const selectedGroup = useSelectedDiaryGroup((store) => store.selectedGroup);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  const [longSelectIndex, setLongSelectIndex] = useState<number | null>(null);

  const deleteNote = useCallback(
    (note: SIDNoteType) => {
      const noteId = note.noteID;
      const chunkMapping = diaryApi.noteChunkMapping;
      if (chunkMapping === null || diaryApi.notes === null) {
        return;
      }

      const updatedNote: SIDNoteType = {
        ...note,
        deleted: true,
      };

      const chunkMappingKeys = Object.keys(chunkMapping);
      let chunkID: string | null = null;
      for (let ix = 0; ix < chunkMappingKeys.length; ix++) {
        const key = chunkMappingKeys[ix];
        const notesInChunk = chunkMapping[key];
        if (notesInChunk.includes(noteId)) {
          chunkID = key;
          break;
        }
      }
      if (chunkID === null) {
        return;
      }
      const dataRetrivalAPI = dataRetrivalApi.getState();

      const updatedNotes = diaryApi.notes.map((n) =>
        n.noteID === noteId ? updatedNote : n
      );
      diaryApi.setNotes(updatedNotes);
      setLongSelectIndex(null);
      dataRetrivalAPI
        .modifyEntry(
          "personalDiaryChunks",
          ["noteID"],
          noteId,
          updatedNote,
          chunkID,
          "replace"
        )
        .then(() => {})
        .catch((err) => {
          console.error("Failed to delete note:", err);
        });
    },
    [
      setLongSelectIndex,
      diaryApi.notes,
      diaryApi.noteChunkMapping,
      diaryApi.setNotes,
    ]
  );

  const addNote = useCallback(() => {
    if (typeof selectedGroup?.groupID !== "string" || diaryApi.notes === null) {
      return;
    }
    const newNote: SIDNoteType = {
      noteID: v4(),
      groupID: selectedGroup.groupID,
      metdata: {
        title: `New Note`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        readOnly: false,
      },
      content: "",
      version: "0.1.1",
    };
    const dataRetrivalAPI = dataRetrivalApi.getState();
    dataRetrivalAPI.appendEntry(
      "personalDiaryChunks",
      newNote,
      personalDiaryNotes
    );
    const newNotes = [...diaryApi.notes, newNote];
    diaryApi.setNotes(newNotes);
  }, [selectedGroup, diaryApi.notes]);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {diaryApi.notes === null ||
          (diaryApi.groups === null || selectedGroup === null ? (
            <ActivityIndicator size="large" color={globalStyle.color} />
          ) : (
            <View
              style={{
                position: "relative",
                width: "100%",
                top: "0%",
                flexGrow: 1,
              }}
            >
              <Animated.View
                style={{
                  position: "relative",
                  width: "100%",
                  top: "0%",
                  flexGrow: 1,
                }}
              >
                <FlashList
                  estimatedItemSize={65}
                  inverted={true}
                  keyExtractor={(item) => item.noteID}
                  data={diaryApi.notes
                    .filter((note) => note.groupID === selectedGroup.groupID)
                    .sort(
                      (a, b) =>
                        (b.metdata?.createdAt || 0) -
                        (a.metdata?.createdAt || 0)
                    )
                    .filter((n) => !n.deleted)}
                  renderItem={({ item, index }) => {
                    const note = item as SIDNoteType;

                    return (
                      <View
                        style={{
                          height: 65,
                          marginBottom: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexDirection: "row",
                        }}
                      >
                        <Button
                          onLongPress={() => {
                            setLongSelectIndex(index);
                          }}
                          textStyle={{ textAlign: "left", paddingLeft: 10 }}
                          onClick={() => {
                            if (longSelectIndex === index) {
                              setLongSelectIndex(null);
                              return;
                            }
                            const selectedNoteAPI =
                              useSelectedDiaryNote.getState();
                            selectedNoteAPI.setSelectedNote(note);
                            router.push("/diary/diaryNoteView/diaryNoteView");
                          }}
                          style={{
                            height: "100%",
                            width: "100%",
                            position: "absolute",
                            display: "flex",
                            justifyContent: "start",
                            alignItems: "center",
                          }}
                          label={""}
                        ></Button>
                        <Text
                          label={note?.metdata?.title || "Unknown"}
                          style={{ zIndex: -1, marginLeft: 10 }}
                        ></Text>
                        <View
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 5,
                            marginLeft: 10,
                            marginRight: longSelectIndex === index ? 0 : 10,
                          }}
                        ></View>
                        {longSelectIndex === index ? (
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              height: "100%",
                            }}
                          >
                            <Text
                              style={{ marginRight: 12, zIndex: -1 }}
                              fontSize={globalStyle.regularMobileFont}
                              label="Cancel"
                            ></Text>
                            <Button
                              onClick={() => {
                                deleteNote(note);
                              }}
                              style={{
                                zIndex: 3,
                                width: 80,
                                borderRadius: 0,
                                borderWidth: 0,
                                borderLeftWidth: 1,
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <TrashIcon
                                height={25}
                                width={"100%"}
                                color={globalStyle.errorColor}
                              ></TrashIcon>
                            </Button>
                          </View>
                        ) : (
                          <View
                            style={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                              marginRight: 10,
                            }}
                          >
                            <Text
                              fontSize={globalStyle.mediumMobileFont}
                              label={new Date(item?.metdata?.createdAt || 0)
                                .toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                                .replace(/\//g, "-")}
                              color={globalStyle.textColorAccent}
                              style={{
                                zIndex: -1,
                              }}
                            ></Text>
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
                <Animated.View
                  entering={customFadeInDown(layoutAnimationsDuration)}
                  style={{
                    marginTop: 5,
                    height: 60,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: "100%",
                      flexDirection: "row",
                      borderRadius: globalStyle.borderRadius,
                    }}
                  >
                    <>
                      <Button
                        onClick={() => {
                          router.back();
                        }}
                        style={{
                          height: "80%",
                          width: "20%",
                          borderWidth: 0,
                          borderRightWidth: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ArrowDeco
                          width={40}
                          height={40}
                          style={{ transform: [{ rotate: "180deg" }] }}
                        ></ArrowDeco>
                      </Button>
                      <Button
                        androidRippleColor={
                          globalStyle.errorColor + ANDROID_RIPPLE_TRANSPARENCY
                        }
                        style={{
                          flexGrow: 1,
                          height: "80%",
                          marginLeft: 15,
                          marginRight: 15,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        fontSize={globalStyle.regularMobileFont}
                        onClick={addNote}
                        label={""}
                      >
                        <AddIcon height={25} width={25}></AddIcon>
                      </Button>
                      <Button
                        style={{
                          height: "80%",
                          width: "20%",
                          borderWidth: 0,
                          borderLeftWidth: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        label=""
                        onClick={() => {
                          router.push(
                            "/diary/diaryGroupConfig/diaryGroupConfig"
                          );
                        }}
                      >
                        <EditDeco height={30} width={30}></EditDeco>
                      </Button>
                    </>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>
          ))}
      </ThemedView>
    </>
  );
}
export default DiaryGroupMain;

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
