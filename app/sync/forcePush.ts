import { getLocalCache } from "@/components/utils/localDb";
import { useActiveUser } from "@/stores/activeUser";
import { addToOutbox } from "@/stores/sync/outboxOps";
import { updatedChunkToOutboxItem } from "@/stores/sync/updatedChunkToOutboxItem";

async function forcePush() {
  const db = await getLocalCache();
  const userId = useActiveUser.getState().activeUser.userId;

  if (typeof userId !== "string") {
    return;
  }

  const timeTrackingChunks = await db.getAllAsync(
    `SELECT * FROM timeTrackingChunks WHERE userID = ?`,
    [userId],
  );
  const dayPlannerChunks = await db.getAllAsync(
    `SELECT * FROM dayPlannerChunks WHERE userID = ?`,
    [userId],
  );
  const diaryGroupsChunks = await db.getAllAsync(
    `SELECT * FROM personalDiaryGroups WHERE userID = ?`,
    [userId],
  );
  const personalDiaryChunks = await db.getAllAsync(
    `SELECT * FROM personalDiaryChunks WHERE userID = ?`,
    [userId],
  );
  const featureConfigChunks = await db.getAllAsync(
    `SELECT * FROM featureConfigChunks WHERE userID = ?`,
    [userId],
  );

  for (const chunk of timeTrackingChunks) {
    const outboxItem = await updatedChunkToOutboxItem(
      chunk,
      null,
      "timeTrackingChunks",
    );

    if (outboxItem !== null) {
      addToOutbox(outboxItem);
    }
  }

  for (const chunk of dayPlannerChunks) {
    const outboxItem = await updatedChunkToOutboxItem(
      chunk,
      null,
      "dayPlannerChunks",
    );

    if (outboxItem !== null) {
      addToOutbox(outboxItem);
    }
  }

  for (const chunk of diaryGroupsChunks) {
    const outboxItem = await updatedChunkToOutboxItem(
      chunk,
      null,
      "personalDiaryGroups",
    );

    if (outboxItem !== null) {
      addToOutbox(outboxItem);
    }
  }

  for (const chunk of personalDiaryChunks) {
    const outboxItem = await updatedChunkToOutboxItem(
      chunk,
      null,
      "personalDiaryChunks",
    );

    if (outboxItem !== null) {
      addToOutbox(outboxItem);
    }
  }

  for (const chunk of featureConfigChunks) {
    const outboxItem = await updatedChunkToOutboxItem(
      chunk,
      null,
      "featureConfigChunks",
    );

    if (outboxItem !== null) {
      addToOutbox(outboxItem);
    }
  }
}

export { forcePush };
