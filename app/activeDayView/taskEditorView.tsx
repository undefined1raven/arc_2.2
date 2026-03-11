import { FeatureConfigBooleanInput } from "@/components/ui/FeatureConfigBooleanInput copy";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { router } from "expo-router";

function TaskEditorView() {
  return (
    <FeatureConfigEmptySettingPage
      bottomHeaderButtonLabel=""
      bottomHeaderButtonOnPress={() => {
        router.back();
      }}
      bototmHeaderLabel="Edit task"
    >
      <FeatureConfigBooleanInput
        value={false}
        label="High Priority"
        onChange={() => {}}
      ></FeatureConfigBooleanInput>
    </FeatureConfigEmptySettingPage>
  );
}

export { TaskEditorView };
