import { getLocalCache } from "@/components/utils/localDb";
import { OutboxItem } from "./outbox";
import { removeFromOutbox } from "./outboxOps";
import { updateChunkCanonicalHash } from "./syncOps";
import { getDeviceId } from "@/components/utils/auth/getDeviceId";
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
    console.log("Processing mutation.id", mutation.mutation_id);
    promises.push(removeFromOutbox(mutation_id));
    promises.push(updateChunkCanonicalHash(chunk_id, hash));
  }

  console.log("Promises:", promises.length);

  return Promise.all(promises)
    .then(async (r) => {
      const db = await getLocalCache();
      const deviceId = getDeviceId();
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

      console.log("FROM EEE", r);
    })
    .catch((e) => {
      console.log("E", e);
    });
}

export { processMutationServerResponse };
