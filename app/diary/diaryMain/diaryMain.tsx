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
function DiaryMain() {
  const diaryApi = useDiaryData();
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  const personalDiaryFeatureConfig = useFeatureConfigs(
    (store) => store.personalDiaryFeatureConfig
  );
  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

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
              <FlashList
                estimatedItemSize={65}
                inverted={true}
                keyExtractor={(item) => item.groupID}
                data={diaryApi.groups}
                renderItem={({ item }) => {
                  const statusLabel =
                    personalDiaryFeatureConfig.find(
                      (r) => r.id === item.metadata.SID
                    )?.name || "Unknown Status";
                  const hasStatus = statusLabel !== "Unknown Status";
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
                        textStyle={{ textAlign: "left", paddingLeft: 10 }}
                        onClick={() => {
                          const selectedGroupAPI =
                            useSelectedDiaryGroup.getState();
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
                        <Text
                          label={item.metadata.alias}
                          style={{ zIndex: -1 }}
                        ></Text>
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
                          gap: 5,
                          marginRight: 10,
                        }}
                      >
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
                      </View>
                    </View>
                  );
                }}
              />
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
