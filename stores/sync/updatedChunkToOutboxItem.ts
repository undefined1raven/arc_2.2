import { OutboxItem } from "./outbox";
import { v4 } from "uuid";
import { useActiveUser } from "@/stores/activeUser";
import { getDeviceId } from "@/components/utils/auth/getDeviceId";
import { getLocalCache } from "@/components/utils/localDb";

async function updatedChunkToOutboxItem(
  updatedChunk: any,
  baseChunk: any,
  featureType: string,
): Promise<OutboxItem | null> {
  if (!updatedChunk || !featureType || typeof featureType !== "string") {
    return null;
  }
  const mutationId = `${featureType}-${v4()}`;
  const accountId = useActiveUser.getState().activeUser.userId;
  const device_id = getDeviceId();
  const db = await getLocalCache();
  if (!accountId || !device_id) {
    return null;
  }

  const hash = updatedChunk.hash;
  const encrypted_content = updatedChunk.encryptedContent;
  const updated_at = updatedChunk.tx;

  console.log("A1");

  const canonicalHashResponse: null | { canonical_hash: string } = await db
    .getFirstAsync(
      "SELECT canonical_hash FROM sync_canonical WHERE chunk_id = ? AND account_id = ?",
      [updatedChunk.id, accountId],
    )
    .catch((e) => {
      console.error("FROM CANONICAL FETCH", e);
    });

  console.log("A2", canonicalHashResponse);

  let base_hash = null;
  if (baseChunk && baseChunk.hash) {
    base_hash = baseChunk.hash;
  }
  if (canonicalHashResponse !== null) {
    //@ts-ignore
    console.log("FOUND CAN HASH:", canonicalHashResponse.canonical_hash);
    const canonical_hash = canonicalHashResponse.canonical_hash;
    base_hash = canonical_hash;
  }

  console.log("A3");

  const outboxItem: OutboxItem = {
    mutation_id: mutationId,
    account_id: accountId,
    device_id: device_id,
    hash: hash,
    base_hash: base_hash,
    feature: featureType,
    chunk_id: updatedChunk.id,
    encrypted_content: encrypted_content,
    updated_at: updated_at,
    version: updatedChunk.version,
  };

  if (
    featureType === "timeTrackingChunks" ||
    featureType === "dayPlannerChunks"
  ) {
    outboxItem["time_range_start"] = updatedChunk.timeRangeStart;
    outboxItem["time_range_end"] = updatedChunk.timeRangeEnd;
  }

  if (featureType === "featureConfigChunks") {
    outboxItem["type"] = updatedChunk.type;
  }

  console.log("OUTBOX ITEM", outboxItem);

  return outboxItem;
}

export { updatedChunkToOutboxItem };
