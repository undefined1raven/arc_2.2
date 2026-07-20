import { chunkPrefixes } from "@/constants/chunkPrefixes";
import { createEmptyEncryptedChunkContent } from "./createEmptyEncryptedChunkContent";
import { getLocalCache } from "../localDb";
import {
  ARC_ChunksType,
  SID_ChunksType,
  SIDGroups_ChunksType,
  Tess_ChunksType,
} from "@/constants/CommonTypes";
import { v4 } from "uuid";
import { getInsertStringFromObject } from "../db/dbUtils";

async function createEmptyChunks(jwkKeyData: string, userId: string) {
  const db = await getLocalCache();

  const empty1 = await createEmptyEncryptedChunkContent(jwkKeyData);
  const empty2 = await createEmptyEncryptedChunkContent(jwkKeyData);
  const empty3 = await createEmptyEncryptedChunkContent(jwkKeyData);
  const empty4 = await createEmptyEncryptedChunkContent(jwkKeyData);

  const emptyNewTimeTrackingChunk: ARC_ChunksType = {
    id: `${chunkPrefixes["timeTrackingChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty1.content,
    tx: Date.now(),
    timeRangeStart: Date.now(),
    timeRangeEnd: Date.now(),
    version: "0.1.2",
    hash: empty1.hash,
  };

  const emptyNewDayPlannerChunk: Tess_ChunksType = {
    id: `${chunkPrefixes["dayPlannerChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty2.content,
    tx: Date.now(),
    timeRangeStart: Date.now(),
    timeRangeEnd: Date.now(),
    version: "0.1.2",
    hash: empty2.hash,
  };

  const emptyNewPersonalDiaryChunk: SID_ChunksType = {
    id: `${chunkPrefixes["personalDiaryChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty3.content,
    tx: Date.now(),
    version: "0.1.2",
    hash: empty3.hash,
  };

  const emptyNewPersonalDiaryGroupChunk: SIDGroups_ChunksType = {
    id: `${chunkPrefixes["personalDiaryGroupChunks"]}${v4()}`,
    userID: userId,
    encryptedContent: empty4.content,
    tx: Date.now(),
    version: "0.1.2",
    hash: empty4.hash,
  };

  const timeTrackingInsertHelperVals = getInsertStringFromObject(
    emptyNewTimeTrackingChunk,
  );
  const timeTrackingChunkPromise = db.runAsync(
    `INSERT INTO timeTrackingChunks ${timeTrackingInsertHelperVals.queryString}`,
    [...timeTrackingInsertHelperVals.values],
  );

  const dayPlannerInsertHelperVals = getInsertStringFromObject(
    emptyNewDayPlannerChunk,
  );
  const dayPlannerChunkPromise = db.runAsync(
    `INSERT INTO dayPlannerChunks  ${dayPlannerInsertHelperVals.queryString}`,
    dayPlannerInsertHelperVals.values,
  );

  const personalDiaryInsertHelperVals = getInsertStringFromObject(
    emptyNewPersonalDiaryChunk,
  );
  const personalDiaryChunkPromise = db.runAsync(
    `INSERT INTO personalDiaryChunks ${personalDiaryInsertHelperVals.queryString}`,
    personalDiaryInsertHelperVals.values,
  );

  const personalDiaryGroupInsertHelperVals = getInsertStringFromObject(
    emptyNewPersonalDiaryGroupChunk,
  );
  const personalDiaryGroupChunkPromise = db.runAsync(
    `INSERT INTO personalDiaryGroups ${personalDiaryGroupInsertHelperVals.queryString}`,
    personalDiaryGroupInsertHelperVals.values,
  );

  console.log("3B");

  return Promise.all([
    timeTrackingChunkPromise,
    dayPlannerChunkPromise,
    personalDiaryChunkPromise,
    personalDiaryGroupChunkPromise,
  ]);
}

export { createEmptyChunks };
