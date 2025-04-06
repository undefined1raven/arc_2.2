import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useNewUserData } from "@/stores/newUserData";
import { v4 } from "uuid";
import { defaultFeatureConfig } from "./config/defaultFeatureConfig";
import { stringToCharCodeArray } from "./fn/charOps";

function newRecoveryCode() {
  return `ARC-RC-${v4()}`;
}

async function getNewRecoveryCodes(symmetricKeyData: string) {
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
        password: newCode,
      })
    );
  }

  const allKeyVariants: string[] = [];
  Promise.allSettled(keyWrappingPromises)
    .then(async (results) => {
      newUserDataApi.setRecoveryCodes(recoveryCodes);
      results.forEach(async (result, index) => {
        if (result.status === "fulfilled") {
          const wrappedSimKey = result.value.payload;
          const stringifiedWrappedSimKey = JSON.stringify(wrappedSimKey);
          allKeyVariants.push(stringifiedWrappedSimKey);
        } else {
          console.error("Failed to wrap key", result.reason);
        }
      });
    })
    .catch((error) => {
      console.error("Error wrapping keys", error);
    });

  return { RCKBackup: JSON.stringify(allKeyVariants) };
}

async function encryptFeatureConfigs(jwkKeyData: string) {
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
        JSON.stringify(timeTrackingFeatureConfig)
      ),
    }
  );

  const diaryConfigEncrpytionPromise = cryptoOpsApi.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: jwkKeyData,
      charCodeData: stringToCharCodeArray(JSON.stringify(diaryFeatureConfig)),
    }
  );

  const dayPlannerConfigEncrpytionPromise = cryptoOpsApi.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: jwkKeyData,
      charCodeData: stringToCharCodeArray(
        JSON.stringify(dayPlannerFeatureConfig)
      ),
    }
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
        userDataKey: string
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

async function createNewAccountBasics() {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const newUserDataApi = useNewUserData.getState();
  const userId = `local.user-${v4()}`;
  const signupTime = Date.now();
  let userDataGlobal = {};

  console.log("Creating new account basics");

  try {
    const newSymmetricKeyResponse = await cryptoOpsApi.performOperation(
      "generateSymmetricKey"
    );

    if (newSymmetricKeyResponse.status !== "success") {
      console.error("Failed to generate symmetric key");
      return;
    }

    const newKeyPairResponse = await cryptoOpsApi.performOperation(
      "generateKeyPair"
    );

    if (newKeyPairResponse.status !== "success") {
      console.error("Failed to generate key pair");
      return;
    }
    const newKeyPair = newKeyPairResponse.payload;
    const newSymmetricKey = newSymmetricKeyResponse.payload;
    const RCKPartial = await getNewRecoveryCodes(newSymmetricKey.jwk);
    const featureConfigPartials = await encryptFeatureConfigs(
      newSymmetricKey.jwk
    );

    const userData = {
      id: userId,
      signupTime: signupTime,
      publicKey: newKeyPair.publicKey,
      ...RCKPartial,
      ...featureConfigPartials,
    };
    userDataGlobal = userData;
  } catch (error) {
    console.error("Error creating new account basics", error);
  }
  return userDataGlobal;
}

export default createNewAccountBasics;
