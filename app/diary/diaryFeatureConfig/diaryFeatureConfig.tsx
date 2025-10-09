import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import { FeatureConfigSIDType } from "@/constants/CommonTypes";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDiaryStatusToEdit } from "@/stores/viewState/diaryStatusToEdit";
import { router } from "expo-router";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { v4 } from "uuid";
import { EditDeco } from "@/components/deco/EditDeco";
function DiaryFeatureConfig() {
  const diaryFeatureConfig = useFeatureConfigs(
    (fc) => fc.personalDiaryFeatureConfig
  );
  const globalStyle = useGlobalStyleStore((gs) => gs.globalStyle);

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

  const renderItem = useCallback(({ item }) => {
    const typedItem = item as FeatureConfigSIDType[number];
    return (
      <View style={{ width: "100%", height: 60 }}>
        <Button
          textStyle={{
            display: "flex",
            textAlign: "left",
            flex: 1,
            paddingLeft: 5,
            fontSize: globalStyle.regularMobileFont,
          }}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
          }}
          onClick={() => {
            const diaryStatusToEditApi = useDiaryStatusToEdit.getState();
            diaryStatusToEditApi.setStatusToEdit(typedItem);

            router.push("/diary/diaryFeatureConfig/diaryFeatureConfigEdit");
          }}
          label={typedItem.name}
        >
          <EditDeco
            style={{
              position: "absolute",
              right: 5,
              width: 35,
              height: 35,
              zIndex: -1,
            }}
          ></EditDeco>
        </Button>
      </View>
    );
  }, []);

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
