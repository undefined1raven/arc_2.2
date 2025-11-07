import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { authChallengeStack } from "../constants/secureStoreKeyNames";
import { requestAuthChallengeStack } from "../auth/authStackRequest";

async function authenticatedApiRequest(
  route: string,
  data: object
): Promise<{
  fetchStatus: "success" | "error";
  data?: any;
  error?: string;
}> {
  let authTokensStr = await SecureStore.getItemAsync(authChallengeStack);
  let authTokens: string[] | null = null;
  try {
    if (typeof authTokensStr !== "string") {
      authTokens = [];
    } else {
      authTokens = JSON.parse(authTokensStr);
    }
  } catch (e) {
    console.error("Failed to parse auth tokens from secure store:", e);
    authTokens = [];
  }

  if (
    authTokens === null ||
    Array.isArray(authTokens) === false ||
    authTokens.length < 2
  ) {
    const authChallengeResults = await requestAuthChallengeStack();
    if (authChallengeResults.status === "error") {
      console.error(
        "Failed to obtain auth challenge stack:",
        authChallengeResults.error
      );
      return {
        fetchStatus: "error",
        error: "Failed to obtain auth challenge stack",
      };
    } else {
      authTokens = authChallengeResults.challenges;
    }
  }

  if (authTokens === null) {
    return { fetchStatus: "error", error: "Failed to obtain auth tokens" };
  }

  console.log("Using auth token:", authTokens[0]);

  return axios
    .post(`${API_URL}${route}`, {
      data: {
        appID: APP_ID,
        authToken: authTokens[0],
        ...data,
      },
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      const unusedTokens = authTokens!.slice(1);
      SecureStore.setItemAsync(
        authChallengeStack,
        JSON.stringify(unusedTokens)
      );
      return { fetchStatus: "success", data: response.data };
    })
    .catch((error) => {
      const data = error.response?.data;

      if (data.error === "Unauthorized") {
        console.log("Auth token invalid, requesting new challenge stack.");
        SecureStore.deleteItemAsync(authChallengeStack);
      }

      return {
        fetchStatus: "error",
        error: error.message,
        responseData: error.response?.data,
      };
    });
}

export { authenticatedApiRequest };
