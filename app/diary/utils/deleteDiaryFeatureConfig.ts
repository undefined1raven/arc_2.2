import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";

async function deleteDiaryFeatureConfig(featureId: string) {
  const dataRetrievalApi = dataRetrivalApi.getState();
  const diaryFeatureConfig =
    useFeatureConfigs.getState().personalDiaryFeatureConfig;

  const deletionRes = await dataRetrievalApi.modifyFeatureConfig(
    "personalDiary",
    ["id"],
    featureId,
    undefined,
    "delete",
  );

  if (deletionRes.status === "success") {
    const updatedFC = diaryFeatureConfig.filter(
      (featureConfigItem) => featureConfigItem.id !== featureId,
    );
    useFeatureConfigs.getState().setPersonalDiaryFeatureConfig(updatedFC);
  }
}

export { deleteDiaryFeatureConfig };
