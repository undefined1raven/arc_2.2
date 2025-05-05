import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import * as SQLite from "expo-sqlite";
import { useActiveUser } from "./activeUser";
import {
  ARC_ChunksType,
  FeatureConfigChunkType,
} from "@/constants/CommonTypes";
import { useCryptoOpsQueue } from "./cryptoOpsQueue";
import { charCodeArrayToString } from "@/components/utils/fn/charOps";
interface IFeatureConfigs {
  decryptFeatureConfigs: () => Promise<void>;
  timeTrackingFeatureConfig: any | null;
  dayPlannerFeatureConfig: any | null;
  personalDiaryFeatureConfig: any | null;
}

const useFeatureConfigs = create<IFeatureConfigs>((set, get) => ({
  decryptFeatureConfigs: async () => {
    const activeUserId = useActiveUser.getState().activeUser.userId;
    const cryptoOpsApi = useCryptoOpsQueue.getState();
    const key = await SecureStore.getItemAsync(
      secureStoreKeyNames.accountConfig.activeSymmetricKey
    );
    if (typeof key !== "string") {
      console.error("Key is not a string");
      return;
    }
    const db = await SQLite.openDatabaseAsync("localCache");
    const FCChunks: FeatureConfigChunkType[] = await db.getAllAsync(
      "SELECT * FROM featureConfigChunks WHERE userID = ? ",
      [activeUserId, "timeTracking"]
    );

    const decryptionPromises: Promise<any>[] = [];

    FCChunks.forEach((chunk: FeatureConfigChunkType) => {
      const encryptedContent = chunk.encryptedContent;
      const decryptionPromise = cryptoOpsApi.performOperation("decrypt", {
        charCodeData: encryptedContent,
        key: key,
        keyType: "symmetric",
      });
      decryptionPromises.push(decryptionPromise);
    });

    return Promise.allSettled(decryptionPromises)
      .then((results) => {
        let timeTrackingFeatureConfig: any[] = [];
        let dayPlannerFeatureConfig: any[] = [];
        let personalDiaryFeatureConfig: any[] = [];
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const decryptionResult = result.value;
            if (decryptionResult.status === "success") {
              try {
                const encodedArray = JSON.parse(
                  "[" + decryptionResult.payload.decrypted + "]"
                );
                const decodedString = charCodeArrayToString(encodedArray);
                const parsedData = JSON.parse(decodedString);
                const type = FCChunks[index].type;
                switch (type) {
                  case "timeTracking":
                    timeTrackingFeatureConfig = [
                      ...timeTrackingFeatureConfig,
                      ...parsedData,
                    ];
                    break;
                  case "dayPlanner":
                    dayPlannerFeatureConfig = [
                      ...dayPlannerFeatureConfig,
                      ...parsedData,
                    ];

                    break;
                  case "personalDiary":
                    personalDiaryFeatureConfig = [
                      ...personalDiaryFeatureConfig,
                      ...parsedData,
                    ];

                    break;
                  default:
                    console.error("Unknown feature config type", type);
                }
              } catch (e) {
                console.error("Error parsing decrypted data", e);
                return;
              }
            }
          }
        });

        set({
          timeTrackingFeatureConfig: timeTrackingFeatureConfig,
          dayPlannerFeatureConfig: dayPlannerFeatureConfig,
          personalDiaryFeatureConfig: personalDiaryFeatureConfig,
        });
        return;
      })
      .catch((e) => {
        console.error("Error decrypting feature config chunks", e);
        return;
      });
  },
  timeTrackingFeatureConfig: null,
  dayPlannerFeatureConfig: null,
  personalDiaryFeatureConfig: null,
}));

export { useFeatureConfigs };
