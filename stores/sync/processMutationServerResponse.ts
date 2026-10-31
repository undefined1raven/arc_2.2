import { getLocalCache } from "@/components/utils/localDb";
import { OutboxItem } from "./outbox";
import { removeFromOutbox } from "./outboxOps";
import { updateChunkCanonicalHash, useSyncLog } from "./syncOps";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { useActiveUser } from "../activeUser";

async function processMutationServerResponse(
  mutations: OutboxItem[],
  lastCursor: number,
) {
  const promises = [];

  if (mutations.length === 0) {
    return;
  }

  for (const mutation of mutations) {
    const { hash, mutation_id, chunk_id } = mutation;
    promises.push(removeFromOutbox(mutation_id));
    promises.push(updateChunkCanonicalHash(chunk_id, hash));
  }

  return Promise.all(promises)
    .then(async (r) => {
      const db = await getLocalCache();
      const deviceId = (await getCurrentDeviceInfo())?.device_id || null;
      const accountId = useActiveUser.getState().activeUser.userId;
      await db.runAsync(
        `
    INSERT INTO syncCursor (
      account_id,
      device_id,
      cursor,
      updated_at
    )
    VALUES (?, ?, ?, ?)
    ON CONFLICT (account_id, device_id)
    DO UPDATE SET
      cursor = excluded.cursor,
      updated_at = excluded.updated_at
  `,
        accountId,
        deviceId,
        lastCursor,
        Date.now(),
      );

      const syncLog = useSyncLog.getState();
      syncLog.setLastPushStatus({
        status: "success",
        message: "[SYNC_PUSH] Sync push successful",
        tx: Date.now(),
      });

      console.log("Last cursor updated: ", r);
    })
    .catch((e) => {
      console.error("syncCursor update error", e);
    });
}

export { processMutationServerResponse };
