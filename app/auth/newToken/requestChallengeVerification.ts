import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import { API_URL } from "@/constants/API_URL";
import * as SecureStore from "expo-secure-store";
async function requestChallengeVerification(
  signedChallenge: string,
  plainChallenge: string,
  deviceId: string,
  accountId: string,
): Promise<
  { error: string; status: "error" } | { status: "success"; token: string }
> {
  const payload = JSON.stringify({
    signedChallenge,
    plainChallenge,
    deviceId,
    accountId,
  });

  return fetch(`${API_URL}/auth/verifyChallenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  })
    .then((r) => {
      return r
        .json()
        .then((res) => {
          if (r.ok === true && typeof res.token === "string") {
            SecureStore.setItem(secureStoreKeyNames.authToken, res.token);
            return { status: "success", token: res.token };
          } else {
            return {
              status: "error",
              error: "API Failed to return auth token",
            };
          }
        })
        .catch((e) => {
          console.error(e);
          return { status: "error", error: e };
        });
    })
    .catch((e) => {
      console.error(e);
      return { status: "error", error: e };
    });
}

export { requestChallengeVerification };
