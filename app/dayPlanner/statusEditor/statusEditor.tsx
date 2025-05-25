import Button from "@/components/common/Button";
import { ColorInput } from "@/components/common/ColorPicker";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import Text from "@/components/common/Text";
import TextInput from "@/components/common/TextInput";
import { EditDeco } from "@/components/deco/EditDeco";
import { SearchIcon } from "@/components/deco/SearchIcon";
import { ThemedView } from "@/components/ThemedView";
import { FeatureConfigColorInput } from "@/components/ui/FeatureConfigColorInput";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { NavMenuBar } from "@/components/ui/NavMenuBar";
import { layoutAnimationsDuration } from "@/constants/animations";
import { TessDayLogType, TessStatusType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

function statusEditor() {
  const [isPickingStatus, setIsPickingStatus] = useState(true);
  const virtualKeyboardApi = useVirtualKeyboard();
  const globalStyle = useGlobalStyleStore();
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (r) => r.dayPlannerFeatureConfig
  );

  const [statusToEdit, setStatusToEdit] = useState<TessStatusType | null>(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent default back action
        if (isPickingStatus) {
          return false;
        } else {
          setIsPickingStatus(true);
          setStatusToEdit(null);
          return true;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isPickingStatus])
  );

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      {isPickingStatus ? (
        <ReversedListWithControls
          renderItem={({ item }) => {
            const typedItem = item as TessStatusType;
            return (
              <Button
                textStyle={{ textAlign: "left", paddingLeft: 10 }}
                onClick={() => {
                  setStatusToEdit(typedItem);
                  setIsPickingStatus(false);
                }}
                style={{
                  height: 55,
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                label={typedItem.name}
              >
                <EditDeco
                  height={30}
                  width={30}
                  style={{ position: "absolute", right: 10, zIndex: -1 }}
                ></EditDeco>
              </Button>
            );
          }}
          showBackButton={false}
          onSearch={() => {}}
          onBackButtonClick={() => {
            setIsPickingStatus(true);
          }}
          showSearchBar={true}
          data={dayPlannerFeatureConfig}
        ></ReversedListWithControls>
      ) : (
        <FeatureConfigEmptySettingPage
          bototmHeaderLabel="Edit Task Status"
          bottomHeaderButtonOnPress={() => {}}
        >
          <FeatureConfigValueInput
            value={statusToEdit?.name}
            onChange={(e) => {}}
            inputType="text"
            label="Name"
          ></FeatureConfigValueInput>
          <FeatureConfigColorInput
            value={"#ffffff"}
            onChange={(e) => {
              console.log("Color changed:", e);
            }}
            label="Text Color"
          ></FeatureConfigColorInput>
          <FeatureConfigColorInput
            value={"#ffffff"}
            onChange={(e) => {
              console.log("Color changed:", e);
            }}
            label="Color"
          ></FeatureConfigColorInput>
        </FeatureConfigEmptySettingPage>
      )}
    </ThemedView>
  );
}
export default statusEditor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
  },
});
