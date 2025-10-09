import Button from "@/components/common/Button";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import Text from "@/components/common/Text";
import TextInput from "@/components/common/TextInput";
import { AddIcon } from "@/components/deco/AddIcon";
import { EditDeco } from "@/components/deco/EditDeco";
import { TrashIcon } from "@/components/deco/TrashIcon";
import { ThemedView } from "@/components/ThemedView";
import { FeatureConfigBooleanInput } from "@/components/ui/FeatureConfigBooleanInput copy";
import { FeatureConfigColorInput } from "@/components/ui/FeatureConfigColorInput";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { FeatureConfigSIDType, TessStatusType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDiaryStatusToEdit } from "@/stores/viewState/diaryStatusToEdit";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 } from "uuid";

function diaryFCStatusEditor() {
  const [isPickingStatus, setIsPickingStatus] = useState(true);
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const diaryFeatureConfig = useFeatureConfigs(
    (r) => r.personalDiaryFeatureConfig
  );
  const statusToEditApi = useDiaryStatusToEdit((r) => r.statusToEdit);

  const [statusToEdit, setStatusToEdit] = useState<
    FeatureConfigSIDType[number] | null
  >(statusToEditApi || null);

  const [longSelectIndex, setLongSelectIndex] = useState<null | number>(null);

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const debouncedUpdate = useCallback(
    (updateFn: () => void) => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      const timeout = setTimeout(() => {
        updateFn();
      }, 300);
      setDebounceTimeout(timeout);
    },
    [debounceTimeout]
  );

  const handleStatusUpdate = useCallback(
    (field: string, value: any) => {
      debouncedUpdate(() => {
        const dataRetrivalAPI = dataRetrivalApi.getState();
        const newStatus = { ...statusToEdit, [field]: value };

        const statusIndex = diaryFeatureConfig.findIndex(
          (status: FeatureConfigSIDType[number]) =>
            status.id === statusToEdit?.id
        );
        if (statusIndex === -1) {
          console.error("Status to edit not found in the list.");
        }
        const updatedStatuses = [...diaryFeatureConfig];
        updatedStatuses[statusIndex] = newStatus;
        const featureConfigApi = useFeatureConfigs.getState();
        featureConfigApi.setPersonalDiaryFeatureConfig(updatedStatuses);
        //@ts-ignore
        setStatusToEdit(newStatus);

        dataRetrivalAPI
          .modifyFeatureConfig(
            "personalDiary",
            ["id"],
            statusToEdit?.id || statusId || "",
            newStatus,
            "replace"
          )
          .then((result) => {
            console.log(`Status ${field} updated:`, result);
          })
          .catch((error) => {
            console.error(`Error updating status ${field}:`, error);
          });
      });
    },
    [debouncedUpdate, statusToEdit]
  );

  const getCurrentColors = useCallback(() => {
    function returnDefaultColors() {
      return {
        textColor: globalStyle.textColor,
        color: globalStyle.color,
      };
    }
    const colors = statusToEdit?.colors;
    if (
      colors === "default" ||
      typeof colors !== "object" ||
      colors === undefined
    ) {
      return returnDefaultColors();
    } else {
      const colorSchemeColors = colors[globalStyle.colorScheme];
      if (!colorSchemeColors) {
        return returnDefaultColors();
      }
      const themeColors = colorSchemeColors[globalStyle.theme];
      if (!themeColors) {
        return returnDefaultColors();
      }
      return {
        textColor: themeColors.textColor || globalStyle.textColor,
        color: themeColors.color || globalStyle.color,
      };
    }
  }, [globalStyle.colorScheme, globalStyle.theme, statusToEdit]);

  const updateColorValue = useCallback(
    (colorType: "color" | "textColor", value: string) => {
      const colors = statusToEdit?.colors;
      if (colors === "default" || typeof colors !== "object") {
        const newColors = {
          [globalStyle.colorScheme]: {
            [globalStyle.theme]: {
              color: colorType === "color" ? value : getCurrentColors().color,
              textColor:
                colorType === "textColor"
                  ? value
                  : getCurrentColors().textColor,
            },
          },
        };
        handleStatusUpdate("colors", newColors);
        return;
      }
      const colorSchemeColors = colors[globalStyle.colorScheme] || null;
      if (colorSchemeColors === null) {
        const newColors = {
          ...colors,
          [globalStyle.colorScheme]: {
            [globalStyle.theme]: {
              color: colorType === "color" ? value : getCurrentColors().color,
              textColor:
                colorType === "textColor"
                  ? value
                  : getCurrentColors().textColor,
            },
          },
        };
        handleStatusUpdate("colors", newColors);
        return;
      }
      const themeColors = colorSchemeColors[globalStyle.theme] || null;
      if (themeColors === null) {
        const newColors = {
          ...colors,
          [globalStyle.colorScheme]: {
            ...colorSchemeColors,
            [globalStyle.theme]: {
              color: colorType === "color" ? value : getCurrentColors().color,
              textColor:
                colorType === "textColor"
                  ? value
                  : getCurrentColors().textColor,
            },
          },
        };
        handleStatusUpdate("colors", newColors);
        return;
      }
      const newColors = {
        ...colors,
        [globalStyle.colorScheme]: {
          ...colorSchemeColors,
          [globalStyle.theme]: {
            ...themeColors,
            [colorType]: value,
          },
        },
      };
      handleStatusUpdate("colors", newColors);
    },
    [
      statusToEdit,
      globalStyle.colorScheme,
      globalStyle.theme,
      getCurrentColors,
      handleStatusUpdate,
    ]
  );

  return (
    <ThemedView style={{ ...styles.container, height: "100%" }}>
      <FeatureConfigEmptySettingPage
        bototmHeaderLabel="Edit Status"
        bottomHeaderButtonLabel="Done"
        bottomHeaderButtonOnPress={() => {
          router.back();
        }}
      >
        <View
          style={{
            width: "100%",
            height: 55,
            marginBottom: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "space-between",
            borderWidth: 1,
            borderRadius: globalStyle.borderRadius,
            borderColor: getCurrentColors().color,
          }}
        >
          <TextInput
            defaultValue={"Example Task"}
            onChange={(e) => {}}
            readOnly={true}
            textAlign="left"
            color={getCurrentColors().textColor}
            style={{
              position: "absolute",
              left: 0,
              flexGrow: 1,
              height: "100%",
              backgroundColor: "#00000000",
              borderWidth: 0,
              width: "64%",
            }}
          ></TextInput>
          <Button
            style={{
              width: "35%",
              position: "absolute",
              right: 10,
              height: "100%",
              borderWidth: 0,
            }}
            androidRippleColor={null}
          ></Button>
          <Text
            style={{
              width: "35%",
              position: "absolute",
              right: 10,
              height: "50%",
              paddingBottom: 3,
              paddingTop: 3,
              zIndex: -1,
            }}
            color={getCurrentColors().textColor}
            label={"Example"}
            backgroundColor={getCurrentColors().color + 35}
            fontSize={15}
          ></Text>
        </View>
        <FeatureConfigColorInput
          value={getCurrentColors().textColor}
          onChange={(e) => {
            updateColorValue("textColor", e);
          }}
          label="Text Color"
        ></FeatureConfigColorInput>
        <FeatureConfigColorInput
          value={getCurrentColors().color}
          onChange={(e) => {
            updateColorValue("color", e);
          }}
          label="Color"
        ></FeatureConfigColorInput>
        <FeatureConfigValueInput
          value={statusToEdit?.name}
          onChange={(e) => {
            handleStatusUpdate("name", e);
          }}
          inputType="text"
          label="Name"
        ></FeatureConfigValueInput>
      </FeatureConfigEmptySettingPage>
    </ThemedView>
  );
}
export default diaryFCStatusEditor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
  },
});
