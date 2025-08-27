import { ActivityIndicator, StyleSheet, View } from "react-native";
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
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowDeco } from "@/components/deco/ArrowDeco";

function LocalLogin() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);

  const bottomInset = useSafeAreaInsets().bottom;

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
          style={{
            position: "absolute",
            top: "35%",
            width: 40,
            height: 60,
          }}
        ></ARCLogoMini>
        <Text
          textAlign="left"
          style={{ height: "5%", width: "80%", marginBottom: "2%" }}
          backgroundColor={globalStyle.color + "20"}
          fontSize={globalStyle.largeMobileFont}
          label="Account PIN"
        ></Text>
        <Text
          textAlign="left"
          numberOfLines={8}
          fontSize={globalStyle.regularMobileFont}
          style={{ width: "85%", marginBottom: "10%" }}
          label="Enter the account PIN you chose when creating your account"
        ></Text>
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
      <View
        style={{
          position: "absolute",
          bottom: bottomInset,
          width: "100%",
          height: 50,
          display: "flex",
          flexDirection: "row",
          marginLeft: 10,
          marginRight: 10,
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={() => {
            router.back();
          }}
          style={{
            height: "100%",
            width: "50%",
            display: "flex",
            alignItems: "center",
            borderWidth: 0,
            justifyContent: "center",
            borderRightWidth: 1,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <Text label="Cancel"></Text>
        </Button>
        <Button
          style={{
            height: "100%",
            width: "50%",
            borderWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowDeco height={35}></ArrowDeco>
        </Button>
      </View>
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
