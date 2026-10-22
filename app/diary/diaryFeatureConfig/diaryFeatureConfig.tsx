import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { useCallback, useState } from "react";
import Button from "@/components/common/Button";
import { FeatureConfigSIDType } from "@/constants/CommonTypes";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDiaryStatusToEdit } from "@/stores/viewState/diaryStatusToEdit";
import { router } from "expo-router";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { v4 } from "uuid";
import { EditDeco } from "@/components/deco/EditDeco";
import { TrashIcon } from "@/components/deco/TrashIcon";
import Text from "@/components/common/Text";
import { deleteDiaryFeatureConfig } from "../utils/deleteDiaryFeatureConfig";
function DiaryFeatureConfig() {
  const diaryFeatureConfig = useFeatureConfigs(
    (fc) => fc.personalDiaryFeatureConfig,
  );
  const globalStyle = useGlobalStyleStore((gs) => gs.globalStyle);
  const [longSelectIndex, setLongSelectIndex] = useState<number | null>(null);

  const addNewStatus = useCallback(() => {
    const newStatus: FeatureConfigSIDType[number] = {
      colors: "default",
      id: `SID-${v4()}`,
      name: "New Status " + Date.now().toString().slice(-4),
      show: true,
    };

    const newFeatureConfig = [...diaryFeatureConfig, newStatus];
    const featureConfigApi = useFeatureConfigs.getState();
    featureConfigApi.setPersonalDiaryFeatureConfig(newFeatureConfig);
    const dataRetrievalApi = dataRetrivalApi.getState();
    dataRetrievalApi
      .appendFeatureConfigEntry("personalDiary", newStatus)
      .then((r) => {
        const diaryStatusToEditApi = useDiaryStatusToEdit.getState();
        diaryStatusToEditApi.setStatusToEdit(newStatus);
        router.push("/diary/diaryFeatureConfig/diaryFeatureConfigEdit");
      })
      .catch((e) => {
        console.error("Error creating new status:", e);
      });
  }, [diaryFeatureConfig]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const typedItem = item as FeatureConfigSIDType[number];
      const isSelected = longSelectIndex === index;
      return (
        <Button
          onLongPress={() => {
            setLongSelectIndex(index);
          }}
          textStyle={{ textAlign: "left", paddingLeft: 10 }}
          onClick={() => {
            if (isSelected) {
              setLongSelectIndex(null);
              return;
            }
            const diaryStatusToEditApi = useDiaryStatusToEdit.getState();
            diaryStatusToEditApi.setStatusToEdit(typedItem);
            router.push("/diary/diaryFeatureConfig/diaryFeatureConfigEdit");
          }}
          style={{
            height: 55,
            marginBottom: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
          label={typedItem.name}
        >
          {isSelected ? (
            <View
              style={{
                position: "absolute",
                right: 0,
                display: "flex",
                flexDirection: "row",
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
                  setLongSelectIndex(null);
                  deleteDiaryFeatureConfig(typedItem.id);
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
            <EditDeco
              height={35}
              width={35}
              style={{ position: "absolute", right: 10, zIndex: -1 }}
            ></EditDeco>
          )}
        </Button>
      );
    },
    [longSelectIndex, globalStyle],
  );

  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <ReversedListWithControls
          data={diaryFeatureConfig}
          showSearchBar={true}
          estimatedItemSize={60}
          renderItem={renderItem}
          showBackButton={true}
          searchKeys={["name"]}
          onBackButtonClick={() => {
            router.back();
          }}
          showActionButton={true}
          onActionButtonClick={addNewStatus}
          searchBarPlaceholder="Search status"
          extraData={longSelectIndex}
          ItemSeparatorComponent={() => <View style={{ height: 5 }}></View>}
        ></ReversedListWithControls>
      </ThemedView>
    </>
  );
}
export default DiaryFeatureConfig;

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
