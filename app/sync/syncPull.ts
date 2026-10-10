import { getLocalCache } from "@/components/utils/localDb";
import { useActiveUser } from "@/stores/activeUser";
import { authenticatedRequest } from "../auth/authenticatedRequest";
import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { OutboxItem } from "@/stores/sync/outbox";

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

  if (cursorRow === null || typeof cursorRow.cursor !== "number") {
    console.error("[SYNC_PULL] Failed to get current cursor");
    return;
  }
  console.log("cursorRow", cursorRow);
  const pullRes = await authenticatedRequest(`/sync/pull`, {
    method: "POST",
    body: JSON.stringify({
      userId: userId,
      deviceId: deviceId.device_id,
      lastCursor: cursorRow.cursor,
    }),
  });

  if (pullRes.status === "error") {
    console.error("[SYNC_PULL] Pull response error");
    return;
  }

  const pullResJson: Partial<OutboxItem> = pullRes.json;
  console.log("pullResJson", pullResJson);
}

export { syncPull };
