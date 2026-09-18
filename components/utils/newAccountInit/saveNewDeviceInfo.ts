import { LocalDeviceIdRow } from "@/constants/CommonTypes";
import { getLocalCache } from "../localDb";

async function saveNewDeviceInfo(deviceInfo: LocalDeviceIdRow) {
  const db = await getLocalCache();

  if (
    typeof deviceInfo.account_id !== "string" ||
    typeof deviceInfo.device_id !== "string" ||
    typeof deviceInfo.private_key_backup !== "string"
  ) {
    throw new Error(
      `Failed to save new device info: ${JSON.stringify(deviceInfo)}`,
    );
  }

  db.runAsync(
    `INSERT INTO deviceIds account_id, device_id, private_key_backup VALUES (?, ?, ?)`,
    [
      deviceInfo.account_id,
      deviceInfo.device_id,
      deviceInfo.private_key_backup,
    ],
  ).catch((e) => {
    throw new Error(`Failed to save new device info to local DB: ${e}`);
  });
}

export { saveNewDeviceInfo };
