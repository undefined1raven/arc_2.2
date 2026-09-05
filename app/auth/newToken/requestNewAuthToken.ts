import { getDeviceId } from "@/components/utils/auth/getDeviceId";
import { API_URL } from "@/constants/API_URL";
import { CreateChallengeResponse } from "@/constants/ApiTypes";
import { useActiveUser } from "@/stores/activeUser";
import { privateKeySign } from "../signJWT";
import { requestChallengeVerification } from "./requestChallengeVerification";

async function requestNewAuthToken(): Promise<
  { error: string; status: "error" } | { status: "success"; token: string }
> {
  const accountId = useActiveUser.getState().activeUser.userId;
  const deviceId = getDeviceId();

  if (accountId === null) {
    return { error: "Account ID not available", status: "error" };
  }
  if (deviceId === null) {
    return { error: "Device ID not available", status: "error" };
  }

  const payload = JSON.stringify({ accountId, deviceId });

  return fetch(`${API_URL}/auth/createChallenge`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: payload,
  })
    .then((r) => {
      return r
        .json()
        .then(async (res: CreateChallengeResponse) => {
          if (typeof res.challenge !== "string") {
            console.error("Invalid response from createChallenge:", res);
            return {
              error: "Failed to fetch challenge. Invalid response.",
              status: "error",
            };
          } else {
            const signedChallenge = await privateKeySign(res.challenge);
            if (signedChallenge.status === "error") {
              return { error: "Failed to sign challenge.", status: "error" };
            } else {
              return requestChallengeVerification(
                signedChallenge.payload.signature,
                res.challenge,
                deviceId,
                accountId,
              );
            }
          }
        })
        .catch((e) => {
          return { error: e, status: "error" };
        });
    })
    .catch((e) => {
      return { error: e, status: "error" };
    });
}

export { requestNewAuthToken };
