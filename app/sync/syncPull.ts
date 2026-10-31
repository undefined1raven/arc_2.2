import { getLocalCache } from "@/components/utils/localDb";
import { useActiveUser } from "@/stores/activeUser";
import { authenticatedRequest } from "../auth/authenticatedRequest";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { SyncPullResponse } from "@/constants/ApiTypes";
import { commitMutations } from "./commitMutations";
import { useSyncLog } from "@/stores/sync/syncOps";

async function syncPull() {
  const db = await getLocalCache();
  const userId = useActiveUser.getState().activeUser.userId;
  const syncLog = useSyncLog.getState();
  const deviceId = await getCurrentDeviceInfo();

  if (typeof userId !== "string") {
    console.error("[SYNC_PULL] Failed to get user id");
    syncLog.setLastPullStatus({
      status: "error",
      message: "[SYNC_PULL] Failed to get user id",
      tx: Date.now(),
    });
    return;
  }

  if (deviceId === null) {
    console.error("[SYNC_PULL] Failed to get device id");
    syncLog.setLastPullStatus({
      status: "error",
      message: "[SYNC_PULL] Failed to get device id",
      tx: Date.now(),
    });

    return;
  }

  const cursorRow: null | { cursor: number } = await db.getFirstAsync(
    "SELECT cursor FROM syncCursor WHERE account_id = ?",
    [userId],
  );

  let lastLocalCursor = cursorRow?.cursor;

  if (lastLocalCursor === undefined) {
    console.error("[SYNC_PULL] Failed to get current cursor");
    syncLog.setLastPullStatus({
      status: "error",
      message: "[SYNC_PULL] Failed to get current cursor",
      tx: Date.now(),
    });

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
    console.error("[SYNC_PULL] Pull response error", initialPullRes);
    syncLog.setLastPullStatus({
      status: "error",
      message: "[SYNC_PULL] Pull response error",
      tx: Date.now(),
    });
    return;
  }

  const pullResJson = initialPullRes.json as unknown as SyncPullResponse;

  const mutationsToApply = pullResJson.mutations;

  if (mutationsToApply.length === 0) {
    syncLog.setLastPullStatus({
      status: "success",
      message: "[SYNC_PULL] Success",
      tx: Date.now(),
    });
    return;
  }

  await commitMutations(pullResJson);

  try {
    ///Update the last local cursor after the initial update
    lastLocalCursor = parseInt(
      mutationsToApply[mutationsToApply.length - 1].id,
    );

    ///Track retries to abort the pull at 3 failed fetches
    let retries = 0;
    let maxRemoteCursor = pullResJson.maxRemoteCursor;

    while (lastLocalCursor < maxRemoteCursor) {
      if (retries > 3) {
        syncLog.setLastPullStatus({
          status: "error",
          message: "[SYNC_PULL] Maximum retries exceeded",
          tx: Date.now(),
        });
        break;
      }

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
        syncLog.setLastPullStatus({
          status: "error",
          message: "[SYNC_PULL] Pull response error",
          tx: Date.now(),
        });
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
        syncLog.setLastPullStatus({
          status: "error",
          message: "[SYNC_PULL] Local commit error",
          tx: Date.now(),
        });
        break;
      }
    }

    syncLog.setLastPullStatus({
      status: "success",
      message: "[SYNC_PULL] Success",
      tx: Date.now(),
    });

    return;
  } catch (e) {
    console.error(e);
    syncLog.setLastPullStatus({
      status: "error",
      message: "[SYNC_PULL] Error: " + e,
      tx: Date.now(),
    });
    return;
  }
}

export { syncPull };
