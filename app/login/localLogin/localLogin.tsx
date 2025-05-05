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
import {
  getPrivateKey,
  getSymmetricKey,
} from "@/components/utils/constants/secureStoreKeyNames";
import { charCodeArrayToString } from "@/components/utils/fn/charOps";

function LocalLogin() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const db = useSQLiteContext();

  ////File state
  const [fileName, setFileName] = useState("");
  const [fileJson, setFileJson] = useState(null);

  ////UI State
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    if (fileJson !== null) {
      setIsLoadingFile(false);
      const keys = Object.keys(fileJson);
      if (
        keys.indexOf("userData") === -1 ||
        keys.indexOf("pk") === -1 ||
        keys.indexOf("timeTrackingChunks") === -1 ||
        keys.indexOf("dayPlannerChunks") === -1 ||
        keys.indexOf("personalDiaryChunks") === -1 ||
        keys.indexOf("personalDiaryGroups") === -1 ||
        keys.indexOf("symkey") === -1
      ) {
        setShowError(true);
        return;
      }
      setHasFile(true);
      setIsLoadingFile(false);
    }
  }, [fileJson]);

  function writeBackupToDB(wait?: boolean) {
    const userData = fileJson.userData;

    const promiseArray = [];
    promiseArray.push(
      db.runAsync(
        `INSERT OR REPLACE INTO users ${
          getInsertStringFromObject(userData).queryString
        }`,
        getInsertStringFromObject(userData).values
      )
    );

    const arcData = fileJson.timeTrackingChunks;
    if (arcData !== null && typeof arcData?.length === "number") {
      arcData.forEach((chunk) => {
        promiseArray.push(
          db
            .runAsync(
              `INSERT OR REPLACE INTO timeTrackingChunks ${
                getInsertStringFromObject(chunk).queryString
              }`,
              getInsertStringFromObject(chunk).values
            )
            .catch((e) => {
              console.log("Error inserting arcData chunk", e);
            })
        );
      });
    }
    const tessData = fileJson.dayPlannerChunks;
    if (tessData !== null && typeof tessData?.length === "number") {
      tessData.forEach((chunk) => {
        promiseArray.push(
          db.runAsync(
            `INSERT OR REPLACE INTO dayPlannerChunks ${
              getInsertStringFromObject(chunk).queryString
            }`,
            getInsertStringFromObject(chunk).values
          )
        );
      });
    }
    const SIDData = fileJson.personalDiaryChunks;
    if (SIDData !== null && typeof SIDData?.length === "number") {
      SIDData.forEach((chunk) => {
        promiseArray.push(
          db.runAsync(
            `INSERT OR REPLACE INTO personalDiaryChunks ${
              getInsertStringFromObject(chunk).queryString
            }`,
            getInsertStringFromObject(chunk).values
          )
        );
      });
    }

    const SIDGroups = fileJson.personalDiaryGroups;
    if (SIDGroups !== null && typeof SIDGroups?.length === "number") {
      SIDGroups.forEach((chunk) => {
        promiseArray.push(
          db.runAsync(
            `INSERT OR REPLACE INTO personalDiaryGroups ${
              getInsertStringFromObject(chunk).queryString
            }`,
            getInsertStringFromObject(chunk).values
          )
        );
      });
    }

    const featureConfigChunks = fileJson.featureConfigChunks;
    if (
      featureConfigChunks !== null &&
      typeof featureConfigChunks?.length === "number"
    ) {
      featureConfigChunks.forEach((chunk) => {
        promiseArray.push(
          db.runAsync(
            `INSERT OR REPLACE INTO featureConfigChunks ${
              getInsertStringFromObject(chunk).queryString
            }`,
            getInsertStringFromObject(chunk).values
          )
        );
      });
    }

    promiseArray.push(
      SecureStore.setItemAsync(getPrivateKey(userData.id), fileJson.pk)
    );

    promiseArray.push(
      SecureStore.setItemAsync(getSymmetricKey(userData.id), userData.PIKBackup)
    );

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
          <Text label="xyz.arc.backup.txt"></Text>
        </Animated.View>
        <Button
          onClick={() => {
            if (hasFile) {
              writeBackupToDB(false);
            } else {
              setIsLoadingFile(true);
              DocumentPicker.getDocumentAsync()
                .then(async (file) => {
                  if (file === null) return;
                  if (file.assets?.length === 0) return;
                  const fileContent = await FileSystem.readAsStringAsync(
                    file.assets[0].uri
                  );
                  setFileName(file.assets[0].name);
                  try {
                    setFileJson(JSON.parse(fileContent));
                  } catch (e) {
                    console.log(e);
                    setShowError(true);
                  }
                })
                .catch((e) => {
                  setShowError(true);
                  console.log(e);
                });
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
