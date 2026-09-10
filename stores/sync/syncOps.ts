import { getLocalCache } from "@/components/utils/localDb";
import { SQLiteDatabase } from "expo-sqlite";
import { useActiveUser } from "../activeUser";

async function updateChunkCanonicalHash(
  chunk_id: string,
  canonical_hash: string,
) {
  const db = await getLocalCache();
  const account_id = useActiveUser.getState().activeUser.userId;

  if (typeof account_id !== "string") {
    return { error: "Failed to get account id", status: "error" };
  }

  console.log("UPDATING CANONICAL HASH", canonical_hash);

  return db
    .runAsync(
      `INSERT INTO sync_canonical (
    account_id,
    chunk_id,
    canonical_hash
    )
    VALUES (?, ?, ?)
    ON CONFLICT (account_id, chunk_id)
    DO UPDATE SET
    canonical_hash = excluded.canonical_hash;`,
      [account_id, chunk_id, canonical_hash],
    )
    .then((r) => {
      return { status: "success" };
    })
    .catch((e) => {
      return { error: e, status: "error" };
    });
}

export { updateChunkCanonicalHash };
