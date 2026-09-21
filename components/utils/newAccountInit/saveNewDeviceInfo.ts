import { getLocalCache } from "../localDb";
import { useNewUserData } from "@/stores/newUserData";

async function saveNewDeviceInfo() {
  const deviceInfo = useNewUserData.getState().deviceData;
  const db = await getLocalCache();

  if (deviceInfo === null) {
    throw new Error("Failed to save new device info");
  }

  if (
    typeof deviceInfo.account_id !== "string" ||
    typeof deviceInfo.device_id !== "string" ||
    typeof deviceInfo.private_key_backup !== "string"
  ) {
    throw new Error(
      `Failed to save new device info: ${JSON.stringify(deviceInfo)}`,
    );
  }

  await db.runAsync(
    `INSERT INTO deviceIds (account_id, device_id, private_key_backup, last_seen, device_public_key, device_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      deviceInfo.account_id,
      deviceInfo.device_id,
      deviceInfo.private_key_backup,
      deviceInfo.last_seen,
      deviceInfo.device_public_key,
      deviceInfo.device_name,
      deviceInfo.created_at,
    ],
  );
}

export { saveNewDeviceInfo };
