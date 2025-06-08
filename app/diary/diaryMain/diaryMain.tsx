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
import { router } from "expo-router";
import { AddIcon } from "@/components/deco/AddIcon";
import { v4 } from "uuid";
import { personalDiaryNotes } from "@/components/utils/constants/chunking";
import { TrashIcon } from "@/components/deco/TrashIcon";
function DiaryMain() {
  const diaryApi = useDiaryData();
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const personalDiaryFeatureConfig = useFeatureConfigs(
    (store) => store.personalDiaryFeatureConfig
  );
  const [longSelectIndex, setLongSelectIndex] = useState<number | null>(null);

  const deleteGroup = useCallback(
    (group: SIDGroupType) => {
      if (diaryApi.groupChunkMapping === null || diaryApi.groups === null) {
        console.error("Diary API is not initialized properly.");
        return;
      }
      const updatedGroup = {
        ...group,
        deleted: true,
      };
      let chunkId = null;
      const chunkMapping = diaryApi.groupChunkMapping;
      const keys = Object.keys(chunkMapping);
      for (let ix = 0; ix < keys.length; ix++) {
        const key = keys[ix];
        const groupIds = chunkMapping[key];
        if (groupIds.includes(group.groupID)) {
          chunkId = key;
          break;
        }
      }
      if (chunkId === null) {
        console.error("No chunk found for group:", group.groupID);
        return;
      }

      const updatedGroups = diaryApi.groups?.map((g) =>
        g.groupID === group.groupID ? updatedGroup : g
      );
      setLongSelectIndex(null);
      diaryApi.setGroups(updatedGroups);

      const dataRetrivalAPI = dataRetrivalApi.getState();
      dataRetrivalAPI
        .modifyEntry(
          "personalDiaryGroups",
          ["groupID"],
          group.groupID,
          updatedGroup,
          chunkId,
          "replace"
        )
        .then((data) => {})
        .catch((error) => {
          console.error("Error deleting group:", error);
        });
    },
    [diaryApi, setLongSelectIndex]
  );

  const createNewGroup = useCallback(() => {
    if (diaryApi.groups === null) {
      return;
    }
    const dataRetrivalAPI = dataRetrivalApi.getState();
    const newGroup: SIDGroupType = {
      name: "New group",
      groupID: `GID-${v4()}`,
      metadata: {
        SID: null,
        alias: "N/G",
        ring: null,
        createdAt: Date.now(),
      },
      type: "person",
      version: "0.1.1",
    };

    const newGroups = [...diaryApi.groups, newGroup];
    diaryApi.setGroups(newGroups);

    dataRetrivalAPI
      .appendEntry("personalDiaryGroups", newGroup, personalDiaryNotes)
      .then((data) => {
        console.log("New group created successfully:", data);
      })
      .catch((error) => {
        console.log("Error creating new group:", error);
      });
  }, [diaryApi.groups]);

  const renderDiaryItem = useCallback(
    ({ item, index }: { item: SIDGroupType; index: number }) => {
      const statusLabel =
        personalDiaryFeatureConfig.find((r) => r.id === item.metadata.SID)
          ?.name || "Unknown Status";
      const hasStatus = statusLabel !== "Unknown Status";

      return (
        <View
          style={{
            height: 65,
            marginBottom: index === 0 ? 25 : 10,
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
              const selectedGroupAPI = useSelectedDiaryGroup.getState();
              selectedGroupAPI.setSelectedGroup(item);
              router.push("/diary/groupView/groupMain");
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
          <View
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              marginLeft: 10,
            }}
          >
            <Text label={item.metadata.alias} style={{ zIndex: -1 }}></Text>
            {hasStatus && (
              <Text
                fontSize={globalStyle.mediumMobileFont}
                label={statusLabel}
                style={{ zIndex: -1 }}
              ></Text>
            )}
          </View>
          <View
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 5,
              marginRight: longSelectIndex === index ? 0 : 10,
            }}
          >
            {longSelectIndex === index ? (
              <>
                <Text
                  style={{ marginRight: 12, zIndex: -1 }}
                  fontSize={globalStyle.regularMobileFont}
                  label="Cancel"
                ></Text>
                <Button
                  onClick={() => deleteGroup(item)}
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
              </>
            ) : (
              <>
                <Text
                  fontSize={globalStyle.mediumMobileFont}
                  label={item.name}
                  color={globalStyle.textColorAccent}
                  style={{
                    zIndex: -1,
                  }}
                ></Text>
                {hasStatus && (
                  <DiaryClosenessIndicator
                    style={{
                      zIndex: -1,
                    }}
                    closeness={item.metadata.ring}
                  ></DiaryClosenessIndicator>
                )}
              </>
            )}
          </View>
        </View>
      );
    },
    [personalDiaryFeatureConfig, longSelectIndex, globalStyle]
  );

  ////Data Retrievel
  useEffect(() => {
    const dataRetrivalAPI = dataRetrivalApi.getState();

    if (diaryApi.notes === null) {
      dataRetrivalAPI
        .getDataInTimeRange(
          "personalDiaryChunks",
          new Date(0).getTime(),
          Date.now(),
          null
        )
        .then((data) => {
          const notes = data.payload as any as SIDNoteType[];
          //@ts-ignore
          diaryApi.setNoteChunkMapping(data.dataChunkMapping);
          diaryApi.setNotes(notes);
        })
        .catch((error) => {
          console.error("Error retrieving diary data:", error);
        });
    }
    if (diaryApi.groups === null) {
      dataRetrivalAPI
        .getDataInTimeRange(
          "personalDiaryGroups",
          new Date(0).getTime(),
          Date.now(),
          null
        )
        .then((data) => {
          const groups = data.payload as any as SIDGroupType[];
          //@ts-ignore
          diaryApi.setGroupsChunkMapping(data.dataChunkMapping);
          diaryApi.setGroups(groups);
        })
        .catch((error) => {
          console.error("Error retrieving diary data:", error);
        });
    }
  }, [diaryApi.notes, diaryApi.groups]);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {diaryApi.notes === null ||
          (diaryApi.groups === null ? (
            <ActivityIndicator size="large" color={globalStyle.color} />
          ) : (
            <Animated.View
              style={{
                position: "relative",
                width: "100%",
                top: "0%",
                flexGrow: 1,
              }}
            >
              <View
                style={{
                  width: "100%",
                  flexGrow: 1,
                  marginBottom: 5,
                }}
              >
                <FlashList
                  estimatedItemSize={65}
                  inverted={true}
                  extraData={longSelectIndex}
                  keyExtractor={(item, index) => item.groupID}
                  data={diaryApi.groups.filter((g) => g.deleted !== true)}
                  renderItem={renderDiaryItem}
                />
                <Animated.View
                  entering={FadeInDown.delay(150).duration(120)}
                  style={{
                    height: 45,
                    width: "20%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                  }}
                >
                  <Button
                    onClick={createNewGroup}
                    style={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}
                    label=""
                  >
                    <View
                      style={{
                        position: "absolute",
                        width: "100%",
                        borderRadius: globalStyle.borderRadius,
                        height: "100%",
                        backgroundColor: globalStyle.colorAltLight,
                      }}
                    ></View>
                    <AddIcon height={20} width={20}></AddIcon>
                  </Button>
                </Animated.View>
              </View>
            </Animated.View>
          ))}
      </ThemedView>
    </>
  );
}
export default DiaryMain;

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
