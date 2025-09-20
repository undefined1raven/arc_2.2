import { ARC_ChunksType } from "@/constants/CommonTypes";
import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
const updateChunksInBatches = async (
  db: any,
  tableName: string,
  chunks: (ARC_ChunksType & { hash: string })[],
  batchSize: number = 50
): Promise<void> => {
  if (chunks.length === 0) return;
  const currentBatch = chunks.slice(0, batchSize);
  const remaining = chunks.slice(batchSize);

  const chunkUpdatePromises = currentBatch.map((chunk) => {
    return db.runAsync(`UPDATE ${tableName} SET hash = ? WHERE id = ?`, [
      chunk.hash,
      chunk.id,
    ]);
  });

  await Promise.allSettled(chunkUpdatePromises);

  // Recurse for the next batch
  await updateChunksInBatches(db, tableName, remaining, batchSize);
};

async function checkChunkTableAndComputeHash(tableName: string) {
  const db = await SQLite.openDatabaseAsync("localCache");
  //Not prone to injections since this fn is only called with constant vals in this component
  const columnsInTable = await db.getAllAsync(
    `PRAGMA table_info(${tableName})`
  );
  if (
    columnsInTable.some(
      //@ts-expect-error
      (tableName: { name: string }) => tableName.name === "hash"
    )
  ) {
    // return;
  }

  //If no hash column is present, create it, fetch all chunks and set the hash for each by using the encryptedContent
  try {
    await db.runAsync(`ALTER TABLE ${tableName} ADD COLUMN hash TEXT`);
  } catch (e) {}

  const existingChunks: ARC_ChunksType[] = await db.getAllAsync(
    `SELECT id, encryptedContent FROM ${tableName}`
  );

  const hashPromises: any[] = [];

  for (let ix = 0; ix < existingChunks.length; ix++) {
    const chunk: ARC_ChunksType = existingChunks[ix] as ARC_ChunksType;
    const content = chunk.encryptedContent;
    const hashPromise = Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      content
    );
    hashPromises.push(hashPromise);
  }

  await Promise.allSettled(hashPromises)
    .then((hashes) => {
      for (let ix = 0; ix < hashes.length; ix++) {
        const hashResult = hashes[ix];

        if (hashResult.status === "fulfilled") {
          const existingChunk = existingChunks[ix];
          const updatedChunk = { ...existingChunk, hash: hashResult.value };
          existingChunks[ix] = updatedChunk;
        } else {
          console.error(hashResult);
        }
      }
    })
    .catch((e) => {
      console.error("Chunk hash error:", e);
    });

  const updatedChunks = existingChunks as (ARC_ChunksType & {
    hash: string;
  })[];
  await updateChunksInBatches(db, tableName, updatedChunks, 50);
}

export { checkChunkTableAndComputeHash };
