import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { useTimeTrackingSelectedActivity } from "@/stores/viewState/timeTrackingSelectedActivity";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { router } from "expo-router";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
function EditActivity() {
  const activityToEdit = useTimeTrackingSelectedActivity(
    (s) => s.activityToEdit
  );
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);
  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        {activityToEdit === null ? (
          <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
        ) : (
          <FeatureConfigEmptySettingPage
            bototmHeaderLabel="Edit activity"
            bottomHeaderButtonOnPress={() => {
              router.back();
            }}
          >
            <FeatureConfigValueInput
              inputType="text"
              onChange={(newName: string) => {}}
              label="Name"
              value={activityToEdit?.itme.name}
            ></FeatureConfigValueInput>
          </FeatureConfigEmptySettingPage>
        )}
      </ThemedView>
    </>
  );
}
export default EditActivity;

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
