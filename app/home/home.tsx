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
import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import DataSetter from "@/components/DataSetter";

function Home() {
  const globalStyle = useGlobalStyleStore((store) => store.globalStyle);
  const db = useSQLiteContext();
  const userAuthApi = useActiveUser();
  const cryptoOpsAPI = useCryptoOpsQueue();

  useEffect(() => {
    db.getFirstAsync("SELECT * FROM timeTrackingChunks LIMIT 1").then((r) => {
      const encryptedContent = r.encryptedContent;
      const key = SecureStore.getItem(
        secureStoreKeyNames.accountConfig.activeSymmetricKey
      );
      cryptoOpsAPI
        .performOperation("decrypt", {
          keyType: "symmetric",
          charCodeData: encryptedContent,
          key: key,
        })
        .then((r) => {
          console.log(r.status);
        })
        .catch((e) => {
          console.log(e);
        });
    });

    console.log("AUID", userAuthApi.activeUser.userId);
    const userID = userAuthApi.activeUser.userId;
  }, []);

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
