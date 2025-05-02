import { useEffect } from "react";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveUser } from "@/stores/activeUser";
import DayPlanner from "../constants/final/dayPlanner.json";
import * as SecureStore from "expo-secure-store";
import {
  getSymmetricKey,
  secureStoreKeyNames,
} from "./utils/constants/secureStoreKeyNames";
import { stringToCharCodeArray } from "./utils/fn/charOps";
import { useSQLiteContext } from "expo-sqlite";
import {
  dayPlannerChunkSize,
  featureConfigChunkSize,
  timeTrackingChunkSize,
} from "./utils/constants/chunking";
import { v4 } from "uuid";

function DataSetter() {
  const cryptoOpsAPI = useCryptoOpsQueue();
  const activeUserAPI = useActiveUser();
  const db = useSQLiteContext();
  useEffect(() => {
    console.log(db.getAllSync("SELECT * FROM dayPlannerChunks").length);
    // function splitArray(size: number, array: any[]) {
    //   const results: any[] = [];
    //   array.forEach((elm, ix) => {
    //     const resultIndex = Math.floor(ix / size);
    //     const existingArr = results[resultIndex];
    //     if (existingArr !== undefined) {
    //       results[resultIndex] = [...existingArr, elm];
    //     } else {
    //       results[resultIndex] = [elm];
    //     }
    //   });
    //   return results;
    // }

    // const flattenedArcFC: any[] = DayPlanner.data;

    // const transfromed = flattenedArcFC.map((dayItem) => {
    //   const day = dayItem.day;
    //   const unixDate = new Date(day).getTime();
    //   dayItem.tx = unixDate;
    //   return dayItem;
    // });

    // const sorted = transfromed.sort((a, b) => a.tx - b.tx);

    // const splitFC = splitArray(dayPlannerChunkSize, sorted);
    // const userID = activeUserAPI.activeUser.userId;
    // if (!userID) {
    //   return;
    // }
    // const symkey = SecureStore.getItem(
    //   secureStoreKeyNames.accountConfig.activeSymmetricKey
    // );

    // const chunkEncryptedContentsPromises: any[] = [];

    // splitFC.forEach((fcc) => {
    //   const p = cryptoOpsAPI.performOperation("encrypt", {
    //     keyType: "symmetric",
    //     key: symkey,
    //     charCodeData: stringToCharCodeArray(JSON.stringify(fcc)),
    //   });
    //   chunkEncryptedContentsPromises.push(p);
    // });

    // Promise.all(chunkEncryptedContentsPromises).then((encryptedChunks) => {
    //   const dbSavePromises = [];
    //   encryptedChunks.forEach((chunk, ix) => {
    //     const dayStr = splitFC[ix][0].day;
    //     const tx = new Date(dayStr).getTime();
    //     console.log(tx, "FTX");
    //     const encryptedContent = {
    //       cipher: chunk.payload.cipher,
    //       iv: chunk.payload.iv,
    //     };
    //     const rdyEncryptedContent = JSON.stringify(encryptedContent);
    //     const newChunk = {
    //       id: `TTC-${v4()}`,
    //       encryptedContent: rdyEncryptedContent,
    //       userID: userID,
    //       tx: tx,
    //       version: "0.1.0",
    //     };
    //     const promise = db.runAsync(
    //       `INSERT INTO dayPlannerChunks (id, encryptedContent, userID, tx, version) VALUES (${"?, ".repeat(
    //         4
    //       )} ?);`,
    //       Object.values(newChunk)
    //     );
    //     dbSavePromises.push(promise);
    //   });
    //   Promise.all(dbSavePromises)
    //     .then((r) => {
    //       console.log(r);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // });
  }, [activeUserAPI.activeUser.userId]);

  return null;
}

export default DataSetter;
