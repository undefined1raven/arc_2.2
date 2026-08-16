import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useNewUserData } from "@/stores/newUserData";
import { v4 } from "uuid";
import { defaultFeatureConfig } from "./config/defaultFeatureConfig";
import { stringToCharCodeArray } from "./fn/charOps";
function newRecoveryCode() {
  return `ARC-RC-${v4()}`;
}
import * as Crypto from "expo-crypto";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { encodeWrappedSymkey } from "./encoding/wrappedSymkey";

async function getNewRecoveryCodes(
  symmetricKeyData: string,
  passphrase: string,
): Promise<
  | { RCKBackup: string; status: "success"; plainRecoveryCodes: string[] }
  | { error: string; status: "failed" }
> {
  if (
    typeof passphrase !== "string" ||
    (passphrase.length >= 4 && passphrase.startsWith("ARC-SK")) === false
  ) {
    return { error: "Passphrase is not valid", status: "failed" };
  }

  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const newUserDataApi = useNewUserData.getState();
  const recoveryCodes: string[] = [];
  const keyWrappingPromises = [];
  for (let ix = 0; ix < 6; ix++) {
    const newCode = newRecoveryCode();
    recoveryCodes.push(newCode);

    keyWrappingPromises.push(
      cryptoOpsApi.performOperation("wrapKey", {
        jwkKeyData: symmetricKeyData,
        keyType: "symmetric",
        password: passphrase.trim() + newCode,
      }),
    );
  }

  try {
    const results = await Promise.allSettled(keyWrappingPromises);
    newUserDataApi.setRecoveryCodes(recoveryCodes);

    const allKeyVariants: string[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        const wrappedSimKey = encodeWrappedSymkey(result.value.payload);
        if (wrappedSimKey === null) {
          return {
            error: "Failed to wrap key: encoding failed",
            status: "failed",
          };
        }
        allKeyVariants.push(wrappedSimKey);
      } else {
        console.error("Failed to wrap key", result.reason);
        return {
          error: "Failed to wrap key: " + result.reason,
          status: "failed",
        };
      }
    }

    return {
      RCKBackup: JSON.stringify(allKeyVariants),
      status: "success",
      plainRecoveryCodes: recoveryCodes,
    };
  } catch (error) {
    console.error("Error wrapping keys", error);
    return {
      error: "Error wrapping keys: " + error,
      status: "failed",
    };
  }
}

async function encryptFeatureConfigs(jwkKeyData: string, userId: string) {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const timeTrackingFeatureConfig = defaultFeatureConfig.arc;
  const diaryFeatureConfig = defaultFeatureConfig.sid;
  const dayPlannerFeatureConfig = defaultFeatureConfig.tess;

  const timeTrackingConfigEncrpytionPromise = cryptoOpsApi.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: jwkKeyData,
      charCodeData: stringToCharCodeArray(
        JSON.stringify(timeTrackingFeatureConfig),
      ),
    },
  );

  const diaryConfigEncrpytionPromise = cryptoOpsApi.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: jwkKeyData,
      charCodeData: stringToCharCodeArray(JSON.stringify(diaryFeatureConfig)),
    },
  );

  const dayPlannerConfigEncrpytionPromise = cryptoOpsApi.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: jwkKeyData,
      charCodeData: stringToCharCodeArray(
        JSON.stringify(dayPlannerFeatureConfig),
      ),
    },
  );

  const encrpytionPromises = [
    timeTrackingConfigEncrpytionPromise,
    diaryConfigEncrpytionPromise,
    dayPlannerConfigEncrpytionPromise,
  ];

  return Promise.allSettled(encrpytionPromises)
    .then((results) => {
      const userDataPartial: { [key: string]: string } = {};
      function handleEncryptionResult(
        promiseIndex: number,
        userDataKey: string,
      ) {
        const result = results[promiseIndex];
        if (typeof result === "undefined") {
          console.error("Encryption result is undefined: ", promiseIndex);
          return;
        }
        const payload = result.value?.payload;
        if (payload === undefined) {
          console.error("Payload is undefined: ", promiseIndex);
          return;
        }
        const encryptionStatus = result.value?.status;
        if (encryptionStatus !== "success") {
          console.error("Encryption failed: ", promiseIndex);
          return;
        }
        const encryptedData = JSON.stringify(payload);
        userDataPartial[userDataKey] = encryptedData;
      }
      handleEncryptionResult(0, "timeTrackingFeatureConfig");
      handleEncryptionResult(1, "diaryFeatureConfig");
      handleEncryptionResult(2, "dayPlannerFeatureConfig");

      return userDataPartial;
    })
    .catch((error) => {
      console.error("Error encrypting feature configs", error);
    });
}

async function generateSecretKey(): Promise<{
  status: "success" | "error";
  payload: string | null;
  error?: any;
}> {
  ///Get a lot of crypto secure bytes
  const secretKey = Crypto.getRandomBytes(512);

  // Convert to hex string
  const hexString = Array.from(secretKey)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Hash the hex string
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hexString,
    {
      encoding: Crypto.CryptoEncoding.BASE64,
    },
  )
    .then((hashedKey) => {
      return { status: "success", payload: "ARC-SK-" + hashedKey };
    })
    .catch((error) => {
      console.error("Error generating secret key", error);
      return { status: "error", payload: null, error: error };
    });
}

async function createNewAccountBasics() {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const userId = `user-${v4()}`;
  const signupTime = Date.now();
  let userDataGlobal = {};

  console.log("Creating new account basics");

  try {
    const newSymmetricKeyResponse = await cryptoOpsApi.performOperation(
      "generateSymmetricKey",
    );

    if (newSymmetricKeyResponse.status !== "success") {
      console.error("Failed to generate symmetric key");
      return;
    }

    const newKeyPairResponse = await cryptoOpsApi.performOperation(
      "generateDPoPKeyPair",
    );

    if (newKeyPairResponse.status !== "success") {
      console.error("Failed to generate key pair");
      return;
    }
    const newKeyPair = newKeyPairResponse.payload;
    const newSymmetricKey = newSymmetricKeyResponse.payload;
    const featureConfigPartials = await encryptFeatureConfigs(
      newSymmetricKey.jwk,
    );

    const activeKeysAPI = useActiveKeys.getState();
    activeKeysAPI.setActiveSymmetricKey(newSymmetricKey.jwk);
    activeKeysAPI.setActivePrivateKey(newKeyPair.privateKey);

    const encryptedPrivateKeyRes = await cryptoOpsApi.performOperation(
      "encrypt",
      {
        keyType: "symmetric",
        key: newSymmetricKey.jwk,
        charCodeData: stringToCharCodeArray(newKeyPair.privateKey),
      },
    );

    if (encryptedPrivateKeyRes.status !== "success") {
      console.error("Failed to encrypt private key");
      return;
    }
    const userData = {
      id: userId,
      signupTime: signupTime,
      publicKey: newKeyPair.publicKey,
      version: "0.0.2",
      ...featureConfigPartials,
      PSKBackup: JSON.stringify(encryptedPrivateKeyRes.payload),
    };
    userDataGlobal = userData;
  } catch (error) {
    console.error("Error creating new account basics", error);
  }

  const secretKeyResponse = await generateSecretKey();

  if (secretKeyResponse.status === "success") {
    return {
      userData: userDataGlobal,
      secretKey: secretKeyResponse.payload,
    };
  } else {
    return { userData: null, secretKey: null };
  }
}

export default createNewAccountBasics;
export { getNewRecoveryCodes, generateSecretKey };
