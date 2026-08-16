import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Button from "@/components/common/Button";
import * as Updates from "expo-updates";
import Text from "@/components/common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DatabaseBackupApi } from "@/components/utils/db/importExportFunctions";
import { NukeLocalData } from "@/components/utils/db/checkTables";
import { ArrowDeco } from "@/components/deco/ArrowDeco";
import { SimpleFooter } from "@/components/common/SimpleFooter";
import { FlashList } from "@shopify/flash-list";
function AccountSettingsMain() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  type SettingOption = {
    name: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    goTo: string;
  };

  const [lastSync, setLastSync] = useState<any[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("lastSync").then((res) => {
      console.log("Fetched last sync tasks:", res);
      try {
        setLastSync(JSON.parse(res));
      } catch (e) {
        console.error("Error parsing last sync tasks:", e);
      }
    });
  }, []);

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
              onClick={() => {
                DatabaseBackupApi.exportDatabase()
                  .then((result) => {})
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
