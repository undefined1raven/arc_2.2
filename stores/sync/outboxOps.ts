import useOutboxStore, { OutboxItem } from "./outbox";
import { checkObjectKeys } from "@/components/utils/fn/checkObjectKeys";
import { getLocalCache } from "@/components/utils/localDb";

const requiredOutboxKeys: (keyof OutboxItem)[] = [
  "hash",
  "base_hash",
  "mutation_id",
  "account_id",
  "device_id",
  "feature",
  "chunk_id",
  "encrypted_content",
  "updated_at",
];

async function addToOutbox(item: OutboxItem) {
  if (!checkObjectKeys(item, requiredOutboxKeys)) {
    console.error("Invalid outbox item");
    return { status: "failed", error: "Invalid outbox item" };
  }

  try {
    const db = await getLocalCache();

    const result = await db.runAsync(
      `INSERT INTO syncOutbox (
        mutation_id,
        account_id,
        device_id,
        feature,
        chunk_id,
        base_hash,
        hash,
        encrypted_content,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (account_id, chunk_id)
      DO UPDATE SET
      mutation_id = excluded.mutation_id,
      hash = excluded.hash,
      encrypted_content = excluded.encrypted_content,
      updated_at = excluded.updated_at;`,
      [
        item.mutation_id,
        item.account_id,
        item.device_id,
        item.feature,
        item.chunk_id,
        item.base_hash,
        item.hash,
        item.encrypted_content,
        item.updated_at,
      ],
    );

    useOutboxStore.getState().appendOutbox(item);

    return {
      status: "success",
      changes: result.changes,
    };
  } catch (err) {
    console.error("Error adding to outbox:", err);

    return {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
async function removeFromOutbox(mutation_id: string) {
  if (!mutation_id) {
    console.error("Invalid mutation_id");
    return { status: "failed", error: "Invalid mutation_id" };
  }

  const db = await getLocalCache();
  return db
    .runAsync(`DELETE FROM syncOutbox WHERE mutation_id = ?`, [mutation_id])
    .then((r) => {
      const outboxStore = useOutboxStore.getState();
      outboxStore.removeItemFromOutbox(mutation_id);
      return { status: "success", changes: r.changes };
    })
    .catch((err) => {
      console.error("Error removing from outbox:", err);
      return { status: "failed", error: err.message };
    });
}

export { addToOutbox, removeFromOutbox };
