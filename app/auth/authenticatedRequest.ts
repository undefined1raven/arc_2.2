import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import * as SecureStore from "expo-secure-store";
import { requestNewAuthToken } from "./newToken/requestNewAuthToken";
import { createDpopProof } from "./createDPoP";
import { API_URL } from "@/constants/API_URL";
async function authenticatedRequest(
  requestPath: string,
  fetchOptions: RequestInit,
  retry: boolean = true,
): Promise<
  | { status: "error"; error: string }
  | { status: "success"; json: object; response: ResponseInit }
> {
  let authToken = await SecureStore.getItemAsync(secureStoreKeyNames.authToken);

  if (authToken === null) {
    const newTokenResponse = await requestNewAuthToken();
    if (
      newTokenResponse.status !== "success" ||
      typeof newTokenResponse.token !== "string"
    ) {
      return { status: "error", error: "Auth token fetch failed [X-4]" };
    } else {
      authToken = newTokenResponse.token;
    }
  }

  if (typeof fetchOptions.method !== "string") {
    return { status: "error", error: "Method not specified" };
  }

  const dpopProof = await createDpopProof(
    fetchOptions.method,
    `${API_URL}/${requestPath}`,
    authToken,
  );

  if (typeof dpopProof !== "string") {
    return { status: "error", error: "Failed to gen new DPoP proof" };
  }

  return fetch(`${API_URL}${requestPath}`, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.headers ?? {}),
      Authorization: `DPoP ${authToken}`,
      DPoP: dpopProof,
    },
  })
    .then(async (r) => {
      if (!r.ok && retry) {
        return authenticatedRequest(requestPath, fetchOptions, false);
      }
      const json = await r.json();
      return { response: r, json, status: "success" };
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
}

export { authenticatedRequest };
