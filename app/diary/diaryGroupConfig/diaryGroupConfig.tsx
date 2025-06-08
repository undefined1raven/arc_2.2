import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { useSelectedDiaryGroup } from "@/stores/viewState/diarySelectedGroup";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { router } from "expo-router";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { RingSelector } from "@/components/ui/RingSelector";
import { DiaryClosenessIndicator } from "@/components/ui/DiaryClosenessIndicator";
import { useCallback } from "react";
import { useDiaryData } from "@/stores/diary/diary";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { SIDGroupType } from "@/constants/CommonTypes";
import { debounce } from "lodash";
function DiaryGroupConfig() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const selectedGroup = useSelectedDiaryGroup((s) => s.selectedGroup);
  const diaryApi = useDiaryData();

  const updateGroupPropertyInstant = useCallback(
    (updatedGroup: SIDGroupType) => {
      const group = selectedGroup;
      if (
        diaryApi.groupChunkMapping === null ||
        diaryApi.groups === null ||
        group === null
      ) {
        console.error("Diary API is not initialized properly.");
        return;
      }
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
      diaryApi.setGroups(updatedGroups);

      const selectedGroupApi = useSelectedDiaryGroup.getState();
      selectedGroupApi.setSelectedGroup(updatedGroup);

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
    [
      diaryApi.groupChunkMapping,
      diaryApi.groups,
      selectedGroup,
      diaryApi.setGroups,
    ]
  );

  const updateGroupProperty = useCallback(
    debounce(updateGroupPropertyInstant, 300),
    [updateGroupPropertyInstant]
  );

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {selectedGroup ? (
          <FeatureConfigEmptySettingPage
            bototmHeaderLabel="Edit group"
            bottomHeaderButtonOnPress={() => {
              router.back();
            }}
          >
            <FeatureConfigValueInput
              label="Alias"
              inputType="text"
              value={selectedGroup.metadata.alias}
              onChange={(newAlias) => {
                const updatedGroup = {
                  ...selectedGroup,
                  metadata: {
                    ...selectedGroup.metadata,
                    alias: newAlias,
                  },
                };
                updateGroupProperty(updatedGroup);
              }}
            ></FeatureConfigValueInput>
            <FeatureConfigValueInput
              value={selectedGroup.name}
              label="SID"
              inputType="text"
              onChange={(newName) => {
                const updatedGroup = {
                  ...selectedGroup,
                  name: newName,
                };
                updateGroupProperty(updatedGroup);
              }}
            ></FeatureConfigValueInput>
            <View
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
                height: 150,
                backgroundColor:
                  globalStyle.color + layoutCardLikeBackgroundOpacity,
                borderRadius: globalStyle.borderRadius,
              }}
            >
              <View
                style={{
                  width: "45%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DiaryClosenessIndicator
                  height={100}
                  width={100}
                  closeness={selectedGroup.metadata.ring}
                ></DiaryClosenessIndicator>
              </View>
              <View
                style={{
                  position: "absolute",
                  left: "45%",
                  width: 1,
                  borderRadius: globalStyle.borderRadius,
                  height: "80%",
                  backgroundColor: globalStyle.color,
                }}
              ></View>
              <View
                style={{
                  width: "55%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RingSelector
                  onRingChange={(ring: number) => {
                    const updatedGroup = {
                      ...selectedGroup,
                      metadata: {
                        ...selectedGroup.metadata,
                        ring: ring,
                      },
                    };
                    updateGroupPropertyInstant(updatedGroup);
                  }}
                  closeness={selectedGroup.metadata.ring}
                ></RingSelector>
              </View>
            </View>
          </FeatureConfigEmptySettingPage>
        ) : (
          <ActivityIndicator></ActivityIndicator>
        )}
      </ThemedView>
    </>
  );
}
export default DiaryGroupConfig;

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
