import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import { useActiveUser } from "@/stores/activeUser";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  authChallengeStack,
  authTokenKeyName,
  deviceId,
  secureStoreKeyNames,
} from "../constants/secureStoreKeyNames";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { getDeviceId } from "./getDeviceId";

async function processAndSaveChallenge(challenge: string): Promise<
  | {
      status: "success";
      token: string;
    }
  | {
      status: "error";
      error: any;
    }
> {
  const activePrivateKey = useActiveKeys.getState().activePrivateKey;

  if (typeof activePrivateKey !== "string") {
    return {
      status: "error",
      error: "No active private key available for decryption.",
    };
  }

  if (typeof challenge !== "string") {
    return {
      status: "error",
      error: "Invalid challenge format.",
    };
  }

  const cryptoOps = useCryptoOpsQueue.getState();
  return cryptoOps
    .performOperation("decrypt", {
      keyType: "private",
      charCodeData: challenge,
      decoding: "base64",
      key: activePrivateKey,
    })
    .then(async (decryptedData) => {
      const token = decryptedData.payload;
      if (decryptedData.status !== "success" || typeof token !== "string") {
        return {
          status: "error",
          error: "Decryption failed.",
        };
      } else {
        await SecureStore.setItemAsync(authTokenKeyName, token);
        return {
          status: "success",
          token: token,
        };
      }
    })
    .catch((error) => {
      return { status: "error", error: error };
    });
}

async function requestAuthChallenge(): Promise<
  { status: "success"; token: string } | { status: "error"; error: any }
> {
  const activeUserId = useActiveUser.getState().activeUser?.userId || null;
  if (typeof activeUserId !== "string") {
    console.log("No active user ID found. Cannot request auth challenge.");
    return {
      status: "error",
      error: "No active user ID found.",
    };
  }
  const currentDeviceId = await SecureStore.getItemAsync(deviceId);

  return axios
    .post(`${API_URL}/auth/requestChallenge`, {
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
        typeof responseData.challenge !== "string"
      ) {
        console.warn("Failed to retrieve valid challenge:", responseData);
        return {
          status: "error",
          error: "Failed to retrieve valid challenge:",
        };
      }
      return processAndSaveChallenge(responseData.challenge);
    })
    .catch((error) => {
      console.log("Error requesting auth challenge:", error);
      return { status: "error", error: error };
    });
}

export { requestAuthChallenge };
