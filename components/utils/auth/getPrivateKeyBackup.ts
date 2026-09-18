import { useActiveUser } from "@/stores/activeUser";
import { getLocalCache } from "../localDb";
import { LocalDeviceIdRow } from "@/constants/CommonTypes";

async function getPrivateKeyBackup() {
  const activeUserId = useActiveUser.getState().activeUser.userId;
  if (typeof activeUserId !== "string") {
    console.error(
      JSON.stringify({
        status: "error",
        error: "Active user id not found",
      }),
    );
    return null;
  }
  const db = await getLocalCache();

  const deviceInfo: null | LocalDeviceIdRow = await db.getFirstAsync(
    `SELECT * FROM deviceIds WHERE account_id = ?`,
    [activeUserId],
  );

  if (deviceInfo === null) {
    console.error(
      JSON.stringify({
        status: "error",
        error: "Device id for active account not found",
      }),
    );
    return null;
  }

  return deviceInfo.private_key_backup;
}

export { getPrivateKeyBackup };
