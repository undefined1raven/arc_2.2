import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import * as NavigationBar from "expo-navigation-bar";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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
import { FlashList } from "@shopify/flash-list";
import { TransferTask, useTransferStore } from "@/stores/dataSyncApi";
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

  const sep = useCallback((item) => {
    return (
      <View
        style={{
          width: "100%",
          height: 15,
        }}
      ></View>
    );
  }, []);

  const renderItem = useCallback((item: TransferTask) => {
    return (
      <View
        style={{
          width: "100%",
          height: 93,
          marginBottom: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 10,
          paddingLeft: 10,
          paddingRight: 5,
        }}
      >
        <Text fontSize={14} label={`[${item.item.id}]`}></Text>
        <Text fontSize={14} label={`[${item.item.status}]`}></Text>
        <Text fontSize={14} label={`[${item.item.type}]`}></Text>
        <Text fontSize={14} label={item.error ?? "No error"}></Text>
      </View>
    );
  }, []);

  return (
    <>
      <ThemedView style={{ ...styles.container, height: "100%" }}>
        <View style={{ width: "100%", height: "100%" }}>
          <View style={{ marginTop: 15, display: "flex", flexGrow: 1 }}>
            <FlashList
              inverted={true}
              data={lastSync}
              estimatedItemSize={120}
              renderItem={renderItem}
              ItemSeparatorComponent={sep}
            />
          </View>
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
