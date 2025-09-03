import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import * as NavigationBar from "expo-navigation-bar";
import { useCallback } from "react";
import Button from "@/components/common/Button";
import * as Updates from "expo-updates";
import { router } from "expo-router";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import themeColors, {
  layoutCardLikeBackgroundOpacity,
  themeColorKeyToDisplayName,
} from "@/constants/colors";
import { Dropdown } from "@/components/deco/Dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserThemeKey } from "@/components/utils/constants/secureStoreKeyNames";
import { useActiveUser } from "@/stores/activeUser";
import { HexDeco } from "@/components/deco/HexDeco";
import { DatabaseBackupApi } from "@/components/utils/db/importExportFunctions";
import { NukeLocalData } from "@/components/utils/db/checkTables";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { SimpleFooter } from "@/components/common/SimpleFooter";
function AccountSettingsMain() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  type SettingOption = {
    name: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    goTo: string;
  };
  const availableThemes = Object.keys(themeColors).map((key) => {
    const colorSet =
      themeColors[key as keyof typeof themeColors][globalStyle.theme];
    const primaryColor = colorSet.color;
    const secondaryColor = colorSet.colorAccent;
    const successColor = colorSet.successColor;
    const errorColor = colorSet.errorColor;
    const backgroundColor = colorSet.pageBackgroundColors[0];
    return {
      name: key,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      primaryColor,
      secondaryColor,
      successColor,
      errorColor,
      backgroundColor,
    };
  });

  const renderItem = useCallback(
    (item) => {
      const isSelected = globalStyle.colorScheme === item.name;

      return (
        <Button
          onClick={() => {
            const globalStyleApi = useGlobalStyleStore.getState();

            const theme = globalStyle.theme;

            //@ts-ignore
            const colorSet = themeColors[item.name][theme];

            NavigationBar.setBackgroundColorAsync(
              colorSet.pageBackgroundColors[1]
            );

            const userId = useActiveUser.getState().activeUser?.userId;

            if (typeof userId !== "string") {
              return;
            }

            console.log(
              "Saving user theme:",
              item.name,
              getUserThemeKey(userId)
            );

            AsyncStorage.setItem(getUserThemeKey(userId), item.name)
              .then((r) => {
                console.log("User theme saved:", r);
              })
              .catch((error) => {
                console.error("Error saving user theme:", error);
              });

            globalStyleApi.updateGlobalStyle({
              ...globalStyle,
              colorScheme: item.name,
              ...colorSet,
            });
          }}
          style={{
            width: "100%",
            height: 93,
            marginBottom: 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 10,
            paddingLeft: 10,
            paddingRight: 5,
          }}
        >
          <View
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Text
              style={{ zIndex: -1 }}
              label={themeColorKeyToDisplayName[item.name]}
            ></Text>
            <View
              style={{
                height: 35,
                padding: 5,
                width: 140,
                zIndex: -1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 5,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: 35,
                  borderRadius: globalStyle.borderRadius,
                  backgroundColor: item.backgroundColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  zIndex: 5,
                  borderRadius: globalStyle.borderRadius,
                  width: 45,
                  backgroundColor: item.primaryColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  zIndex: 5,
                  borderRadius: globalStyle.borderRadius,
                  width: 20,
                  backgroundColor: item.secondaryColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  borderRadius: globalStyle.borderRadius,
                  width: 20,
                  zIndex: 5,
                  backgroundColor: item.successColor,
                }}
              ></View>
              <View
                style={{
                  height: "100%",
                  borderRadius: globalStyle.borderRadius,
                  width: 20,
                  zIndex: 5,
                  backgroundColor: item.errorColor,
                }}
              ></View>
            </View>
          </View>
          {isSelected && (
            <View
              style={{ position: "absolute", right: 10, height: 30, width: 30 }}
            >
              <HexDeco
                color={globalStyle.color}
                height={30}
                width={30}
              ></HexDeco>
            </View>
          )}
        </Button>
      );
    },
    [globalStyle]
  );

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <View style={{ width: "100%", height: "100%" }}>
          <View
            style={{
              display: "flex",
              flexGrow: 1,
              gap: 15,
              justifyContent: "flex-end",
            }}
          >
            <View>
              <Button
                onDoubleClick={() => {
                  NukeLocalData();
                  Updates.reloadAsync();
                }}
                borderColor={globalStyle.errorColor}
                textStyle={{ color: globalStyle.errorTextColor }}
                style={{ height: 50 }}
                label="Delete local data [double tap]"
              ></Button>
              <View
                style={{
                  width: "100%",
                  height: 60,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ArrowDeco
                  style={{ transform: [{ rotate: "-90deg" }] }}
                  width={30}
                  height={25}
                  color={globalStyle.errorColor}
                ></ArrowDeco>
                <Text color={globalStyle.errorColor} label="Danger Zone"></Text>
                <View
                  style={{
                    marginLeft: 10,
                    flexGrow: 1,
                    height: 1,
                    backgroundColor: globalStyle.errorColor,
                  }}
                ></View>
              </View>
            </View>
            <Button
              onLongPress={() => {
                DatabaseBackupApi.exportDatabase(false)
                  .then((result) => {
                    if (result.success) {
                      console.log("Backup exported successfully:", result);
                    }
                  })
                  .catch((error) => {
                    console.error("Error exporting backup:", error);
                  });
              }}
              onClick={() => {
                DatabaseBackupApi.exportDatabase(false)
                  .then((result) => {
                    if (result.success) {
                      console.log("Backup exported successfully:", result);
                    }
                  })
                  .catch((error) => {
                    console.error("Error exporting backup:", error);
                  });
              }}
              style={{ height: 50 }}
              label="Export Backup"
            ></Button>
          </View>
          <View style={{ marginTop: 10 }}>
            <SimpleFooter label="Settings / Account Settings / Backups"></SimpleFooter>
          </View>
        </View>
      </ThemedView>
    </>
  );
}
export default AccountSettingsMain;

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
