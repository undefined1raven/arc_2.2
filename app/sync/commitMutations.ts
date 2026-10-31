import { getCurrentDeviceInfo } from "@/components/utils/auth/getDeviceId";
import { getLocalCache } from "@/components/utils/localDb";
import { SyncPullResponse } from "@/constants/ApiTypes";
import { useActiveUser } from "@/stores/activeUser";

async function commitMutation(mutation: SyncPullResponse["mutations"][number]) {
  const {
    chunk_id,
    feature_table,
    encrypted_content,
    tx,
    version,
    time_range_end,
    time_range_start,
    hash,
    user_id,
    feature_config_type,
  } = mutation;

  console.log("processing chunk id: ", chunk_id);

  const db = await getLocalCache();
  let placeholders = "?, ?, ?, ?, ?, ?";
  let columns = "id, userID, encryptedContent, tx, version, hash";
  let updateColumns =
    "encryptedContent = excluded.encryptedContent, tx = excluded.tx, hash = excluded.hash";

  let values: any[] = [chunk_id, user_id, encrypted_content, tx, version, hash];

  if (
    feature_table === "timeTrackingChunks" ||
    feature_table === "dayPlannerChunks"
  ) {
    placeholders += ", ?, ?";
    columns += ", timeRangeStart, timeRangeEnd";
    updateColumns += `,
  timeRangeStart = excluded.timeRangeStart,
  timeRangeEnd = excluded.timeRangeEnd
`;
    values.push(time_range_start, time_range_end);
  }

  if (feature_table === "featureConfigChunks") {
    placeholders += ", ?";
    columns += ", type";
    updateColumns += ", type = excluded.type";
    values.push(feature_config_type);
  }

  return db.runAsync(
    `INSERT INTO ${feature_table} (${columns}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updateColumns};`,
    values,
  );
}

async function commitMutations(pullResponse: SyncPullResponse) {
  const deviceid = (await getCurrentDeviceInfo())?.device_id || null;
  const userId = useActiveUser.getState().activeUser.userId;
  if (deviceid === null) {
    console.error("Failed to get local device id");
    throw new Error("Failed to get local device id");
  }

  if (userId === null) {
    console.error("Failed to get local user id");
    throw new Error("Failed to get local user id");
  }

  const mutationsToApply = pullResponse.mutations;
  const savePromises = [];

  if (mutationsToApply.length === 0) {
    return true;
  }

  for (const mutation of mutationsToApply) {
    savePromises.push(commitMutation(mutation));
  }

  await Promise.all(savePromises).catch((e) => {
    console.error("Failed to process mutations to save: ", e);
    throw new Error("Failed to process mutations to save: ", e);
  });

  const lastCursorSaved = mutationsToApply[mutationsToApply.length - 1].id;

  const db = await getLocalCache();

  const cursorUpdateResponse = await db.runAsync(
    `UPDATE syncCursor SET cursor = ?, updated_at = ? WHERE account_id = ? AND device_id = ?`,
    [lastCursorSaved, Date.now(), userId, deviceid],
  );

  if (cursorUpdateResponse.changes === 1) {
    console.info("UPDATED PULL CURSOR SUCCESSFULY");
    return true;
  } else {
    console.error("Failed to update local cursor");
    throw new Error("Failed to update local cursor");
  }
}

export { commitMutations };
