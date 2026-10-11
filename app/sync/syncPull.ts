import { getLocalCache } from "@/components/utils/localDb";
import { useActiveUser } from "@/stores/activeUser";
import { authenticatedRequest } from "../auth/authenticatedRequest";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { SyncPullResponse } from "@/constants/ApiTypes";
import { commitMutations } from "./commitMutations";

async function syncPull() {
  const db = await getLocalCache();
  const userId = useActiveUser.getState().activeUser.userId;

  const deviceId = await getCurrentDeviceInfo();

  if (typeof userId !== "string") {
    console.error("[SYNC_PULL] Failed to get user id");
    return;
  }

  if (deviceId === null) {
    console.error("[SYNC_PULL] Failed to get device id");
    return;
  }

  const cursorRow: null | { cursor: number } = await db.getFirstAsync(
    "SELECT cursor FROM syncCursor WHERE account_id = ?",
    [userId],
  );

  let lastLocalCursor = cursorRow?.cursor;

  if (lastLocalCursor === undefined) {
    console.error("[SYNC_PULL] Failed to get current cursor");
    return;
  }

  const initialPullRes = await authenticatedRequest(`/sync/pull`, {
    method: "POST",
    body: JSON.stringify({
      userId: userId,
      deviceId: deviceId.device_id,
      lastCursor: lastLocalCursor,
    }),
  });

  if (initialPullRes.status === "error") {
    console.error("[SYNC_PULL] Pull response error");
    return;
  }

  const pullResJson = initialPullRes.json as unknown as SyncPullResponse;
  await commitMutations(pullResJson);

  try {
    ///Update the last local cursor after the initial update
    const commitedMutations = pullResJson.mutations;

    if (commitedMutations.length === 0) {
      return;
    }

    lastLocalCursor = parseInt(
      commitedMutations[commitedMutations.length - 1].id,
    );

    ///Track retries to abort the pull at 3 failed fetches
    let retries = 0;
    let maxRemoteCursor = pullResJson.maxRemoteCursor;

    while (lastLocalCursor < maxRemoteCursor) {
      const pullResponse = await authenticatedRequest(`/sync/pull`, {
        method: "POST",
        body: JSON.stringify({
          userId: userId,
          deviceId: deviceId.device_id,
          lastCursor: lastLocalCursor,
        }),
      });

      if (pullResponse.status === "error") {
        console.error("[SYNC_PULL] Pull response error");
        retries++;
        continue;
      }
      const pullResponseJson = pullResponse.json as unknown as SyncPullResponse;
      const successfulCommit = await commitMutations(pullResponseJson);

      const commitedMutations = pullResponseJson.mutations;

      lastLocalCursor = parseInt(
        commitedMutations[commitedMutations.length - 1].id,
      );

      if (successfulCommit) {
        continue;
      } else {
        break;
      }
    }

    return;
  } catch (e) {
    console.error(e);
    return;
  }
}

export { syncPull };
