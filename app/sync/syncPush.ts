import { useActiveUser } from "@/stores/activeUser";
import { getLocalCache } from "@/components/utils/localDb";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { authenticatedRequest } from "../auth/authenticatedRequest";
import { processMutationServerResponse } from "@/stores/sync/processMutationServerResponse";

async function syncPush(forcePush: boolean = false) {
  const db = await getLocalCache();
  const userid = useActiveUser.getState().activeUser.userId;
  const deviceid = (await getCurrentDeviceInfo())?.device_id || null;

  if (deviceid === null) {
    console.error("Unable to perform sync push, no valid device id found");
    return;
  }

  const outbox = await db.getAllAsync(
    "SELECT * FROM syncOutbox WHERE account_id = ?",
    [userid],
  );

  const batches = [];

  const maxMutationsPerBatch = 5;

  for (let i = 0; i < outbox.length; i += maxMutationsPerBatch) {
    batches.push(outbox.slice(i, i + maxMutationsPerBatch));
  }
  console.log("OUTBOX LEN", outbox.length, " BATCHES LEN", batches.length);

  const maxConcurrentRequests = 5;
  const responses = [];

  for (let i = 0; i < batches.length; i += maxConcurrentRequests) {
    const batchResponses = await Promise.all(
      batches.slice(i, i + maxConcurrentRequests).map((batch) =>
        authenticatedRequest("/sync/push", {
          method: "POST",
          body: JSON.stringify({
            mutations: batch,
            userId: userid,
            deviceId: deviceid,
            forcePush: forcePush,
          }),
        }),
      ),
    );
    responses.push(...batchResponses);
  }

  const allCommits = [];
  const cursors: number[] = [];

  for (const response of responses) {
    if (response.status !== "success") {
      console.error("Request failed:", response.error);
      continue;
    }

    const responseData = response.json;

    // @ts-ignore
    const commitResults = responseData.commitResults;
    // @ts-ignore
    const lastCursor = responseData.lastCursor;

    allCommits.push(
      ...commitResults.flatMap((x: { commited: unknown[] }) => x.commited),
    );

    if (typeof lastCursor === "number") {
      cursors.push(lastCursor);
    }
  }

  const lastCursor = cursors.length > 0 ? Math.max(...cursors) : null;

  console.log("ALL COMMITS", allCommits.length, "LAST CURSOR", lastCursor);

  if (allCommits.length === 0) {
    return;
  }

  if (Array.isArray(allCommits) && typeof lastCursor === "number") {
    processMutationServerResponse(allCommits, lastCursor);
  } else {
    console.error(
      "Failed to process mutation server response.",
      allCommits,
      lastCursor,
    );
  }
}

export { syncPush };
