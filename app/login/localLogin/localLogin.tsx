import { ActivityIndicator, StyleSheet } from "react-native";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ThemedView } from "@/components/ThemedView";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import Text from "@/components/common/Text";
import Animated from "react-native-reanimated";
import Button from "@/components/common/Button";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
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
import { useOfflineLoginTempStore } from "@/stores/offlineLoginTempStore";
import { getLocalCache, getTempLocalCache } from "@/components/utils/localDb";
import { checkCreds } from "./checkCreds";

function LocalLogin() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const offlineLoginTempStore = useOfflineLoginTempStore();

  ////File state
  const [fileName, setFileName] = useState("");
  const [filePickerResult, setFilePickerResult] =
    useState<null | DocumentPicker.DocumentPickerSuccessResult>(null);

  ////UI State
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoginValid, setIsLoginValid] = useState(false);
  const [showError, setShowError] = useState<null | string>(null);
  const [hasFile, setHasFile] = useState(false);
  const [headerProps, setHeaderProps] = useState<{
    color: string;
    backgroundColor: string;
  }>({ color: globalStyle.color, backgroundColor: globalStyle.color + "10" });

  const showErrTimeoutRef = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    if (isLoginValid && hasFile) {
      setHeaderProps({
        color: globalStyle.successColor,
        backgroundColor: globalStyle.successColor + "10",
      });
    } else if (hasFile === true) {
      setHeaderProps({
        color: globalStyle.errorTextColor,
        backgroundColor: globalStyle.errorColor + "10",
      });
    } else {
      setHeaderProps({
        color: globalStyle.color,
        backgroundColor: globalStyle.color + "10",
      });
    }
  }, [hasFile, isLoginValid]);

  function showErrorMsg(text: string, timeout?: number) {
    setShowError(text);
    if (showErrTimeoutRef.current === null) {
      showErrTimeoutRef.current = setTimeout(
        () => {
          setShowError(null);
        },
        timeout ? timeout : 5000,
      );
    }
  }

  // function writeBackupToDB(wait?: boolean) {
  //   if (wait) {
  //     return Promise.all(promiseArray);
  //   } else {
  //     Promise.all(promiseArray)
  //       .then((res) => {
  //         Updates.reloadAsync();
  //       })
  //       .catch((e) => {
  //         showErrorMsg("Failed to import account.");
  //         console.log(e);
  //       });
  //   }
  // }

  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini
          style={{ width: 40, height: 60, marginBottom: "10%" }}
        ></ARCLogoMini>
        <Text
          textAlign="left"
          style={{ height: "5%", width: "80%", marginBottom: "2%" }}
          fontSize={globalStyle.largeMobileFont}
          label={
            hasFile && isLoginValid
              ? "Account loaded successfuly"
              : hasFile
                ? "Failed to load account."
                : "Pick your back-up file."
          }
          {...headerProps}
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
            if (hasFile && offlineLoginTempStore.pin) {
              if (isLoginValid === false) {
                return;
              }
              const permaDbImportRes = await DatabaseBackupApi.importDatabase(
                filePickerResult,
                true,
              );

              if (permaDbImportRes.status === "error") {
                return;
              }

              await SecureStore.setItemAsync(
                secureStoreKeyNames.accountConfig.pin,
                offlineLoginTempStore.pin +
                  (offlineLoginTempStore.passphrase
                    ? offlineLoginTempStore.passphrase
                    : ""),
                {
                  requireAuthentication: true,
                  authenticationPrompt:
                    "Authenticate to use your screen lock to unlock",
                },
              )
                .catch((e) => {
                  console.log(e);
                })
                .then(async () => {
                  await SecureStore.setItemAsync(
                    secureStoreKeyNames.accountConfig.useBiometricAuth,
                    "true",
                  );
                  Updates.reloadAsync();
                });
              // writeBackupToDB(false);
            } else {
              const result = await DocumentPicker.getDocumentAsync({
                type: [
                  "application/x-sqlite3",
                  "application/octet-stream",
                  "*/*",
                ],
                copyToCacheDirectory: true,
              });

              if (result.canceled) {
                return { status: "error", message: "Import cancelled" };
              }
              setFilePickerResult(result);
              DatabaseBackupApi.importDatabase(result, false)
                .then(async (r) => {
                  if (r.status === "error") {
                    showErrorMsg("Failed to import account data.");
                    setIsLoadingFile(false);
                    return;
                  }
                  const db = await getTempLocalCache();
                  const userData: {
                    id: string;
                    PIKBackup: string;
                    PSKBackup: string;
                  } | null = await db.getFirstAsync(
                    "SELECT id, PIKBackup, PSKBackup FROM users;",
                  );
                  if (
                    typeof userData === "object" &&
                    userData?.PIKBackup &&
                    userData?.id
                  ) {
                    SecureStore.setItemAsync(
                      getSymmetricKey(userData.id),
                      userData.PIKBackup,
                    );
                    SecureStore.setItemAsync(
                      getPrivateKey(userData.id),
                      userData.PSKBackup,
                    );

                    const isLoginValid: boolean = await checkCreds(
                      userData.PIKBackup,
                    );
                    if (isLoginValid === false) {
                      showErrorMsg(
                        "Pin or passphrase don't match the backup file ",
                      );
                    }
                    setIsLoginValid(isLoginValid);
                    setIsLoadingFile(false);
                    setFileName(r.fileName ?? "");
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
            if (hasFile === false) {
              router.replace("/NewAccountMain/page");
            } else {
              setHasFile(false);
              setIsLoginValid(false);
              setFileName("");
            }
          }}
          style={{ width: "75%", height: "6%" }}
          label="Cancel"
        ></Button>
        <Animated.View
          style={{
            width: "80%",
            height: "25%",
            marginTop: "5%",
          }}
        >
          {isLoadingFile && showError !== null && (
            <ActivityIndicator color={globalStyle.color}></ActivityIndicator>
          )}
          {showError !== null && (
            <Text
              fontSize={globalStyle.regularMobileFont}
              color={globalStyle.errorColor}
              textAlign="center"
              style={{
                width: "100%",
                marginBottom: "10%",
              }}
              label={showError}
            ></Text>
          )}
          {hasFile &&
            fileName &&
            isLoadingFile === false &&
            showError === null && (
              <Text
                fontSize={globalStyle.regularMobileFont}
                style={{ width: "100%", marginBottom: "10%" }}
                label={`Backup file detected: ${fileName}`}
              ></Text>
            )}
        </Animated.View>
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
