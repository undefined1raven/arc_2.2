import { ActivityIndicator, StyleSheet } from "react-native";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { ThemedView } from "@/components/ThemedView";
import { ARCLogoMini } from "@/components/deco/ARCLogoMini";
import { useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useActiveUser } from "@/stores/activeUser";
import { charCodeArrayToString } from "@/components/utils/fn/charOps";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import * as SecureStore from "expo-secure-store";
import {
  getPrivateKey,
  getSymmetricKey,
  secureStoreKeyNames,
} from "@/components/utils/constants/secureStoreKeyNames";
import DataSetter from "@/components/DataSetter";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { dayPlannerChunkSize } from "@/components/utils/constants/chunking";
import { StorageAccessFramework } from "expo-file-system";
import * as FileSystem from "expo-file-system";

function Home() {
  const dataRetrivalApix = dataRetrivalApi();
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const db = useSQLiteContext();
  const userAuthApi = useActiveUser();
  const cryptoOpsAPI = useCryptoOpsQueue();

  // useEffect(() => {
  //   const userID = userAuthApi.activeUser.userId;

  //   async function saveFile() {
  //     const permissions =
  //       await StorageAccessFramework.requestDirectoryPermissionsAsync();
  //     if (!permissions.granted) {
  //       console.log("Permission denied");
  //       return;
  //     }

  //     const userData = await db.getFirstAsync(
  //       `SELECT * FROM users WHERE id = '${userID}'`
  //     );
  //     const timeTrackingChunks = await db.getAllAsync(
  //       `SELECT * FROM timeTrackingChunks WHERE userID = '${userID}'`
  //     );
  //     const personalDiaryChunks = await db.getAllAsync(
  //       `SELECT * FROM personalDiaryChunks WHERE userID = '${userID}'`
  //     );
  //     const personalDiaryGroups = await db.getAllAsync(
  //       `SELECT * FROM personalDiaryGroups WHERE userID = '${userID}'`
  //     );
  //     const dayPlannerChunks = await db.getAllAsync(
  //       `SELECT * FROM dayPlannerChunks WHERE userID = '${userID}'`
  //     );

  //     const featureConfigChunks = await db.getAllAsync(
  //       `SELECT * FROM featureConfigChunks WHERE userID = '${userID}'`
  //     );

  //     const pk = await SecureStore.getItemAsync(getPrivateKey(userID));
  //     const symkey = await SecureStore.getItemAsync(getSymmetricKey(userID));
  //     let accountBackup = {
  //       userData,
  //       timeTrackingChunks,
  //       personalDiaryChunks,
  //       personalDiaryGroups,
  //       dayPlannerChunks,
  //       featureConfigChunks,
  //       pk,
  //       symkey,
  //     };

  //     function getUTC() {
  //       const date = new Date();
  //       return date.toLocaleString("en-GB", {
  //         day: "2-digit",
  //         month: "short",
  //         year: "numeric",
  //       });
  //     }

  //     try {
  //       await StorageAccessFramework.createFileAsync(
  //         permissions.directoryUri,
  //         `backup.txt`,
  //         "text/plain"
  //       )
  //         .then(async (uri) => {
  //           await FileSystem.writeAsStringAsync(
  //             uri,
  //             JSON.stringify(accountBackup),
  //             {
  //               encoding: FileSystem.EncodingType.UTF8,
  //             }
  //           );
  //         })
  //         .catch((e) => {
  //           console.log(e);
  //         });
  //     } catch (e) {
  //       throw new Error(e);
  //     }
  //   }
  //   saveFile();
  //   // dataRetrivalApix
  //   //   .getDataInTimeRange("timeTrackingChunks", 1707331242000, 1709836842000)
  //   //   .then((x) => {
  //   //     console.log("Data setter response", x.status);
  //   //   })
  //   //   .catch((e) => {
  //   //     console.log("Data setter error", e);
  //   //   });
  // }, []);

  return (
    <>
      <ThemedView style={styles.container}>
        <ARCLogoMini style={{ width: 60, height: 60 }}></ARCLogoMini>
      </ThemedView>
    </>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
