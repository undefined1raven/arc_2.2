import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  authChallengeStack,
  authTokenKeyName,
} from "../constants/secureStoreKeyNames";
import { requestAuthChallenge } from "../auth/authStackRequest";

async function makeCall(
  route: string,
  data: object,
  retry?: boolean
): Promise<{
  fetchStatus: "success" | "error";
  data?: any;
  error?: string;
}> {
  return axios
    .post(`${API_URL}${route}`, {
      data: {
        appID: APP_ID,
        ...data,
      },
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("API Response:", response.data);
      return { fetchStatus: "success", data: response.data };
    })
    .catch(async (error) => {
      const data = error.response?.data;
      if (data.error === "Unauthorized") {
        const challengeRequestResults = await requestAuthChallenge();
        if (challengeRequestResults.status === "success" && retry === false) {
          let authToken = challengeRequestResults.token;
          return makeCall(route, { ...data, authToken: authToken }, true);
        } else {
          console.log("Unauthorized API request:", data);
          return {
            fetchStatus: "error",
            error: "Unauthorized",
            responseData: data,
          };
        }
      } else {
        return {
          fetchStatus: "error",
          error: error.message,
          responseData: error.response?.data,
        };
      }
    });
}

async function authenticatedApiRequest(
  route: string,
  data: object
): Promise<{
  fetchStatus: "success" | "error";
  data?: any;
  error?: string;
}> {
  let authToken = await SecureStore.getItemAsync(authTokenKeyName);
  if (typeof authToken !== "string") {
    const challengeRequestResults = await requestAuthChallenge();
    if (challengeRequestResults.status === "success") {
      authToken = challengeRequestResults.token;
      console.log("Obtained new auth token:", authToken);
      return makeCall(route, { ...data, authToken: authToken });
    } else {
      return {
        fetchStatus: "error",
        error: "No auth token available",
      };
    }
  } else {
    console.log("Using existing auth token:", authToken);
    return makeCall(route, { ...data, authToken: authToken });
  }
}

export { authenticatedApiRequest };
