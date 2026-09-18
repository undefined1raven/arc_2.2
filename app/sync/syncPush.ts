import { useActiveUser } from "@/stores/activeUser";
import { getLocalCache } from "@/components/utils/localDb";
import { getDeviceId } from "@/components/utils/auth/getDeviceId";
import { authenticatedRequest } from "../auth/authenticatedRequest";
import { processMutationServerResponse } from "@/stores/sync/processMutationServerResponse";

async function syncPush() {
  const db = await getLocalCache();
  const userid = useActiveUser.getState().activeUser.userId;
  const deviceid = getDeviceId();

  const outbox = await db.getAllAsync("SELECT * FROM syncOutbox");

  console.log("OUTBOX LEN", outbox.length);

  const batches = [];

  for (let i = 0; i < outbox.length; i += 30) {
    batches.push(outbox.slice(i, i + 30));
  }

  const responses = await Promise.all(
    batches.map((batch) =>
      authenticatedRequest("/sync/push", {
        method: "POST",
        body: JSON.stringify({
          mutations: batch,
          userId: userid,
          deviceId: deviceid,
        }),
      }),
    ),
  );

  const allCommits = [];
  const cursors: number[] = [];

  for (const response of responses) {
    if (response.status !== "success") {
      console.error("Request failed:", response.error);
      continue;
    }

    // @ts-ignore
    const commitResults = response.json.commitResults;
    // @ts-ignore
    const lastCursor = response.json.lastCursor;

    allCommits.push(...commitResults.flatMap((x) => x.commited));

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
