import Button from "@/components/common/Button";
import ReversedListWithControls from "@/components/common/ReversedListWithControls";
import { EditDeco } from "@/components/deco/EditDeco";
import { ThemedView } from "@/components/ThemedView";
import { FeatureConfigBooleanInput } from "@/components/ui/FeatureConfigBooleanInput copy";
import { FeatureConfigColorInput } from "@/components/ui/FeatureConfigColorInput";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import { TessStatusType } from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";

function statusEditor() {
  const [isPickingStatus, setIsPickingStatus] = useState(true);
  const virtualKeyboardApi = useVirtualKeyboard();
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (r) => r.dayPlannerFeatureConfig
  );

  const [statusToEdit, setStatusToEdit] = useState<TessStatusType | null>(null);

  const getPreviewValue = useCallback((color: string, defaultColor: string) => {
    if (color === "default" || typeof color !== "string") {
      return defaultColor;
    }
    return color;
  }, []);

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

        const statusIndex = dayPlannerFeatureConfig.findIndex(
          (status: TessStatusType) => status.statusID === statusToEdit?.statusID
        );
        if (statusIndex === -1) {
          console.error("Status to edit not found in the list.");
        }
        const updatedStatuses = [...dayPlannerFeatureConfig];
        updatedStatuses[statusIndex] = newStatus;
        const featureConfigApi = useFeatureConfigs.getState();
        featureConfigApi.setDayPlannerFeatureConfig(updatedStatuses);
        //@ts-ignore
        setStatusToEdit(newStatus);

        dataRetrivalAPI
          .modifyFeatureConfig(
            "dayPlanner",
            ["statusID"],
            statusToEdit?.statusID,
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
      {isPickingStatus ? (
        <ReversedListWithControls
          searchKeys={["name"]}
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
          data={dayPlannerFeatureConfig.filter(
            (r: TessStatusType) => !r.deleted
          )}
        ></ReversedListWithControls>
      ) : (
        <FeatureConfigEmptySettingPage
          bototmHeaderLabel="Edit Task Status"
          bottomHeaderButtonOnPress={() => {
            setStatusToEdit(null);
            setIsPickingStatus(true);
          }}
        >
          <FeatureConfigBooleanInput
            value={!statusToEdit?.deleted}
            label="Enabled"
            onChange={(e) => {
              handleStatusUpdate("deleted", !e);
            }}
          ></FeatureConfigBooleanInput>
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
