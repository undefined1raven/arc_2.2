import { privateKeySign } from "@/app/auth/signJWT";
import { generateNewDeviceId } from "@/components/utils/auth/getDeviceId";
import { getAccountEncryptedPrivateKey } from "@/components/utils/constants/secureStoreKeyNames";
import { decryptAccountPrivateKey } from "@/components/utils/crypto/decryptAccountPrivateKey";
import { sortObjectKeys } from "@/components/utils/data/sortObjectKeys";
import { stringToCharCodeArray } from "@/components/utils/fn/charOps";
import { getLocalCache, getTempLocalCache } from "@/components/utils/localDb";
import { API_URL } from "@/constants/API_URL";
import { DeviceType, LocalDeviceIdRow } from "@/constants/CommonTypes";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveKeys } from "@/stores/decryptedKeys";
import * as SecureStore from "expo-secure-store";

async function saveDeviceInfoToLocalDb(deviceObj: DeviceType) {
  const db = await getLocalCache();
  await db
    .runAsync(
      `INSERT INTO deviceIds (device_id, device_public_key, private_key_backup, device_name, created_at, last_seen, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        deviceObj.device_id,
        deviceObj.device_public_key,
        deviceObj.private_key_backup,
        deviceObj.device_name,
        deviceObj.created_at,
        deviceObj.last_seen,
        deviceObj.account_id,
      ],
    )
    .then((res) => {
      console.error("AHHHH, Device info saved to local database", res);
    })
    .catch((error) => {
      console.error("AHHHH, Error saving device info to local database", error);
    });
}

async function createAndRegisterNewDevice(userObj: { id: string }) {
  console.log("------------------------------------------R3");

  const newDeviceId = generateNewDeviceId();
  const cryptoOps = useCryptoOpsQueue.getState();
  const newDeviceKeyPairRes = await cryptoOps.performOperation(
    "generateDPoPKeyPair",
  );
  if (newDeviceKeyPairRes.status === "error") {
    throw new Error("Failed to generate new key pair for device");
  }

  console.log("------------------------------------------R4");

  const publicKey = newDeviceKeyPairRes.payload.publicKey;
  const privateKey = newDeviceKeyPairRes.payload.privateKey;
  const symKey = useActiveKeys.getState().activeSymmetricKey;

  if (symKey === null) {
    throw new Error("No active symmetric key found");
  }

  console.log("------------------------------------------R5");

  const encryptedDevicePrivateKeyRes = await cryptoOps.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: symKey,
      charCodeData: stringToCharCodeArray(privateKey),
    },
  );

  console.log("------------------------------------------R6");

  const newDeviceObj: DeviceType = {
    device_id: newDeviceId,
    device_public_key: publicKey,
    private_key_backup: JSON.stringify(encryptedDevicePrivateKeyRes.payload),
    device_name: newDeviceId.slice(5, 11),
    created_at: Date.now(),
    last_seen: Date.now(),
    account_id: userObj.id,
  };

  const challengeRes = await fetch(
    `${API_URL}/devices/registration/challenge`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: userObj.id, device_id: newDeviceId }),
    },
  );

  console.log("------------------------------------------R7");

  try {
    if (challengeRes.ok === false) {
      throw new Error("Failed to get challenge for device registration");
    }
    const challengeResponseJson: { challenge: string } =
      await challengeRes.json();
    if (typeof challengeResponseJson.challenge !== "string") {
      throw new Error("Invalid challenge response from server");
    }
    const payloadToSign = {
      deviceInfo: newDeviceObj,
      challenge: challengeResponseJson.challenge,
    };

    console.log("------------------------------------------R8");

    const encryptedAccountPrivateKey = await SecureStore.getItemAsync(
      getAccountEncryptedPrivateKey(userObj.id),
    );

    if (encryptedAccountPrivateKey === null) {
      throw new Error("No encrypted account private key found");
    }

    console.log("------------------------------------------R9");

    const accountPrivateKeyRes = await decryptAccountPrivateKey(userObj.id);

    if (
      typeof accountPrivateKeyRes !== "string" &&
      accountPrivateKeyRes.status === "error"
    ) {
      throw new Error("Failed to decrypt account private key");
    }

    const signatureResult = await privateKeySign(
      JSON.stringify(sortObjectKeys(payloadToSign)),
      accountPrivateKeyRes as string,
    );

    console.log("------------------------------------------R10");

    if (signatureResult.status === "error") {
      throw new Error("Failed to sign device registration payload");
    }

    const signature = signatureResult.payload.signature;

    const registrationResult = await fetch(
      `${API_URL}/devices/registration/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedPayload: payloadToSign,
          signature: signature,
        }),
      },
    );

    console.log("------------------------------------------R11");

    if (registrationResult.ok === false) {
      throw new Error("Failed to register new device");
    }

    try {
      console.log("------------------------------------------R12");

      const registrationResultJson = await registrationResult.json();
      if (registrationResultJson.status !== "success") {
        throw new Error("Device registration failed on server");
      }
      console.log("------------------------------------------R13");

      if (registrationResultJson.status === "success") {
        await saveDeviceInfoToLocalDb(newDeviceObj);
        return true;
      }
    } catch (e) {
      throw new Error("Failed to parse device registration response");
    }
  } catch (e) {
    console.error("Failed to get challenge for device registration", e);
    throw new Error("Failed to get challenge for device registration");
  }
}

async function checkOrInitLocalDeviceId() {
  console.log("------------------R1");

  const db = await getLocalCache();
  const userObj: { id: string } | null =
    await db.getFirstAsync(`SELECT id FROM users`);

  if (userObj === null) {
    console.error("No user found in local database");
    return { status: "error", error: "No user found in local database" };
  }

  const userId = userObj.id;
  const deviceObj: null | LocalDeviceIdRow = await db
    .getFirstAsync(`SELECT * FROM deviceIds WHERE account_id = ?`, [userId])
    .catch((e) => {
      console.error(
        "Something went wrong while getting local device info: ",
        e,
      );
      return { status: "error", error: e };
    });
  console.log("------------------R2", deviceObj);
  if (deviceObj === null) {
    ///Create and register new device
    console.log("Starting device registration");
    try {
      const isNewDeviceRegistered = await createAndRegisterNewDevice(userObj);
      if (isNewDeviceRegistered) {
        return { status: "success" };
      } else {
        return { status: "error", error: "Failed to register new device" };
      }
    } catch (e) {
      console.error("Failed to create and register new device", e);
      return {
        status: "error",
        error: "Failed to create and register new device: " + e,
      };
    }
  } else if (typeof deviceObj?.device_id === "string") {
    console.log("Trying to fetch data for existing device");
    try {
      const res = await fetch(`${API_URL}/devices/findOne`, {
        method: "POST",
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
      return { status: "error", error: "Failed to check device id" };
    }
  } else {
    return { status: "error", error: "Failed to get local devices list" };
  }
}

export { checkOrInitLocalDeviceId };
