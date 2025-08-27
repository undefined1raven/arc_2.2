import { ActivityIndicator, StyleSheet } from "react-native";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ThemedView } from "@/components/ThemedView";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import Text from "@/components/common/Text";
import Animated from "react-native-reanimated";
import Button from "@/components/common/Button";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { getInsertStringFromObject } from "@/components/utils/db/dbUtils";
import * as Updates from "expo-updates";
import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";
import {
  getPrivateKey,
  getSymmetricKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import { charCodeArrayToString } from "@/components/utils/fn/charOps";
import TextInput from "@/components/common/TextInput";
import { DatabaseBackupApi } from "@/components/utils/db/importExportFunctions";

function LocalLogin() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);

  ////File state
  const [fileName, setFileName] = useState("");

  ////UI State
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const [pin, setpin] = useState("");

  function writeBackupToDB(wait?: boolean) {
    if (wait) {
      return Promise.all(promiseArray);
    } else {
      Promise.all(promiseArray)
        .then((res) => {
          Updates.reloadAsync();
        })
        .catch((e) => {
          setShowError(true);
          console.log(e);
        });
    }
  }

  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini
          style={{ width: 40, height: 60, marginBottom: "10%" }}
        ></ARCLogoMini>
        <Text
          textAlign="left"
          style={{ height: "5%", width: "80%", marginBottom: "2%" }}
          backgroundColor={globalStyle.color + "20"}
          fontSize={globalStyle.largeMobileFont}
          label="Pick your back-up file"
        ></Text>
        <Text
          textAlign="left"
          numberOfLines={8}
          fontSize={globalStyle.regularMobileFont}
          style={{ width: "85%", marginBottom: "10%" }}
          label="The file you’re looking for looks something like this if you haven’t renamed it"
        ></Text>
        <Animated.View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: "10%",
          }}
        >
          <Text label="arc-backup-x-y.db"></Text>
        </Animated.View>
        <Button
          onClick={async () => {
            if (hasFile) {
              await SecureStore.setItemAsync(
                secureStoreKeyNames.accountConfig.pin,
                pin,
                {
                  requireAuthentication: true,
                  authenticationPrompt:
                    "Authenticate to use your screen lock to unlock",
                }
              )
                .catch((e) => {
                  console.log(e);
                })
                .then(async () => {
                  await SecureStore.setItemAsync(
                    secureStoreKeyNames.accountConfig.useBiometricAuth,
                    "true"
                  );
                  Updates.reloadAsync();
                });
              writeBackupToDB(false);
            } else {
              DatabaseBackupApi.importDatabase()
                .then(async (r) => {
                  if (r.status === "error") {
                    setShowError(true);
                    setIsLoadingFile(false);
                    return;
                  }
                  const db = await SQLite.openDatabaseAsync("localCache");
                  const userData: { id: string; PIKBackup: string } | null =
                    await db.getFirstAsync("SELECT id, PIKBackup FROM users;");
                  db.closeAsync();
                  if (
                    typeof userData === "object" &&
                    userData?.PIKBackup &&
                    userData?.id
                  ) {
                    SecureStore.setItemAsync(
                      getSymmetricKey(userData.id),
                      userData.PIKBackup
                    );
                    setIsLoadingFile(false);
                    setShowError(false);
                    setHasFile(true);
                  } else {
                    console.error("No user data found in the backup file.");
                  }
                })
                .catch((e) => {});
            }
          }}
          style={{ width: "75%", height: "6%", marginBottom: "4%" }}
          label={hasFile ? "Restore" : "Select a file"}
        ></Button>
        <Button
          onClick={() => {
            router.back();
          }}
          style={{ width: "75%", height: "6%" }}
          label="Cancel"
        ></Button>
        <Animated.View
          style={{
            width: "80%",
            height: "15%",
            marginTop: "5%",
          }}
        >
          {isLoadingFile && showError === false && (
            <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
          )}
          {showError && (
            <Text
              fontSize={globalStyle.regularMobileFont}
              style={{ width: "100%", marginBottom: "10%" }}
              label="Error loading file, please try again"
            ></Text>
          )}
          {hasFile && isLoadingFile === false && showError === false && (
            <Text
              fontSize={globalStyle.regularMobileFont}
              style={{ width: "100%", marginBottom: "10%" }}
              label={`Backup file detected: ${fileName}`}
            ></Text>
          )}
        </Animated.View>
        <TextInput
          style={{ width: "80%", height: "6%" }}
          keyboardType="numeric"
          secureTextEntry={true}
          onChange={(e) => {
            const text = e.nativeEvent.text;
            setpin(text);
          }}
        ></TextInput>
      </ThemedView>
    </>
  );
}
export default LocalLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
