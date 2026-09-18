import { generateNewDeviceId } from "@/components/utils/auth/getDeviceId";
import { getLocalCache } from "@/components/utils/localDb";
import { API_URL } from "@/constants/API_URL";
import { LocalDeviceIdRow } from "@/constants/CommonTypes";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";

async function initDevice() {
  //init new device id
  const cryptoOps = useCryptoOpsQueue.getState();
  const newDeviceId = generateNewDeviceId();
  const newKeyPairRes = await cryptoOps.performOperation("generateDPoPKeyPair");
  if (newKeyPairRes.status === "error") {
    throw new Error("Failed to generate new key pair for device");
  }
  const publicKey = newKeyPairRes.payload.publicKey;
  const privateKey = newKeyPairRes.payload.privateKey;
  console.log(publicKey, privateKey);
}

async function checkOrInitLocalDeviceId() {
  const db = await getLocalCache();
  const userObj: { id: string } | null =
    await db.getFirstAsync(`SELECT id FROM users`);

  if (userObj === null) {
    throw new Error("Failed to check local device id");
  }
  const userId = userObj.id;
  const deviceObj: null | LocalDeviceIdRow = await db.getFirstAsync(
    `SELECT * FROM deviceIds WHERE account_id = ?`,
    [userId],
  );
  console.log("DEVICES", deviceObj);
  if (deviceObj === null) {
  } else {
    try {
      const res = await fetch(`${API_URL}/devices/findOne`, {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceObj.device_id,
          account_id: userId,
        }),
      });
      const json = await res.json();
      console.log(json, "FROM DEVICE CHECK");
    } catch (e) {
      console.error("Something went wrong when checking device id", e);
    }
  }
}

export { checkOrInitLocalDeviceId };
