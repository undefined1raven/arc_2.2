import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import { useActiveUser } from "@/stores/activeUser";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  authChallengeStack,
  deviceId,
  secureStoreKeyNames,
} from "../constants/secureStoreKeyNames";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { getDeviceId } from "./getDeviceId";

async function processAndSaveChallengeStack(challengeStack: string[]) {
  const existingStack = await SecureStore.getItemAsync(authChallengeStack);
  let existingChallengeResponses: string[] = [];
  if (existingStack) {
    existingChallengeResponses = JSON.parse(existingStack);
  }
  const activePrivateKey = useActiveKeys.getState().activePrivateKey;
  const decryptionPromises: any[] = [];

  if (typeof activePrivateKey !== "string") {
    return {
      status: "error",
      error: "No active private key available for decryption.",
    };
  }

  challengeStack.forEach((charCodeData) => {
    const cryptoOps = useCryptoOpsQueue.getState();
    const promise = cryptoOps.performOperation("decrypt", {
      keyType: "private",
      charCodeData: charCodeData,
      decoding: "base64",
      key: activePrivateKey,
    });
    decryptionPromises.push(promise);
  });

  const decryptedChallenges = await Promise.all(decryptionPromises);
  const decryptedValues = decryptedChallenges.map(
    (res) => res.payload?.decrypted
  );
  const isDecryptionSuccessful = decryptedValues.every(
    (val) => typeof val === "string"
  );

  if (isDecryptionSuccessful === false) {
    console.warn("Decryption of one or more challenges failed.");
    return {
      status: "error",
      error: "Decryption of one or more challenges failed.",
    };
  }

  const allValues = [...existingChallengeResponses, ...decryptedValues];

  await SecureStore.setItemAsync(authChallengeStack, JSON.stringify(allValues));

  return {
    status: "success",
    challenges: allValues,
  };
}

async function requestAuthChallengeStack(): Promise<
  { status: "success"; challenges: string[] } | { status: "error"; error: any }
> {
  const activeUserId = useActiveUser.getState().activeUser?.userId || null;
  if (typeof activeUserId !== "string") {
    console.log(
      "No active user ID found. Cannot request auth challenge stack."
    );
    return {
      status: "error",
      error: "No active user ID found.",
    };
  }
  const currentDeviceId = await SecureStore.getItemAsync(deviceId);

  return axios
    .post(`${API_URL}/auth/requestChallengeStack`, {
      data: {
        appID: APP_ID,
        accountID: activeUserId,
        deviceId: currentDeviceId,
      },
    })
    .then((response) => {
      const responseData = response.data;
      if (
        responseData.status !== "success" ||
        !Array.isArray(responseData.challenges)
      ) {
        console.warn("Failed to retrieve valid challenge stack:", responseData);
        return {
          status: "error",
          error: "Failed to retrieve valid challenge stack:",
        };
      }
      return processAndSaveChallengeStack(responseData.challenges);
    })
    .catch((error) => {
      console.log("Error requesting auth challenge stack:", error);
      return { status: "error", error: error };
    });
}

export { requestAuthChallengeStack };
