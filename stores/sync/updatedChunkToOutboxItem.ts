import { OutboxItem } from "./outbox";
import { v4 } from "uuid";
import { useActiveUser } from "@/stores/activeUser";
import { getDeviceId } from "@/components/utils/auth/getDeviceId";

function updatedChunkToOutboxItem(
  updatedChunk: any,
  baseChunk: any,
  featureType: string,
): OutboxItem | null {
  if (!updatedChunk || !featureType || typeof featureType !== "string") {
    return null;
  }
  const mutationId = `${featureType}-${v4()}`;
  const accountId = useActiveUser.getState().activeUser.userId;
  const device_id = getDeviceId();

  if (!accountId || !device_id) {
    return null;
  }

  const hash = updatedChunk.hash;
  let base_hash = null;
  if (baseChunk && baseChunk.hash) {
    base_hash = baseChunk.hash;
  }
  const encrypted_content = updatedChunk.encryptedContent;
  const updated_at = updatedChunk.tx;

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
  };
  return outboxItem;
}

export { updatedChunkToOutboxItem };
