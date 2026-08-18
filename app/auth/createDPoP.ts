import { secureStoreKeyNames } from "@/components/utils/constants/secureStoreKeyNames";
import * as SecureStore from "expo-secure-store";
import * as crypto from "expo-crypto";
import { hashAccessToken } from "./hashAccessToken";
import { strToBase64Url } from "@/components/utils/encoding/strToBase64url";
import { signJWT } from "./signJWT";

export async function createDpopProof(
  method: string,
  url: string,
  accessToken?: string,
): Promise<string | { status: "error"; error: string }> {
  ///1. Get info we need to craft the JWT
  let devicePublicKey: null | object = null;
  try {
    const devicePublicKeyString = await SecureStore.getItemAsync(
      secureStoreKeyNames.userPublicKey,
    );
    if (devicePublicKeyString === null) {
      console.error("No device public key found");
      return { status: "error", error: "No device public key found" };
    }
    devicePublicKey = JSON.parse(devicePublicKeyString);
  } catch (e) {
    console.error("Failed to parse device public key. [TKR-34]");
    return {
      status: "error",
      error: "Failed to parse device public key. [TKR-34]",
    };
  }

  const jti = crypto.randomUUID();
  const iat = Math.floor(Date.now() / 1000);

  ///2. JWT Header
  const header = {
    typ: "dpop+jwt",
    alg: "ES256",
    jwk: devicePublicKey,
  };

  ///3. JWT Body
  let accessTokenAth: { ath: string } | {} = {};
  if (accessToken !== undefined) {
    const accessTokenHash = await hashAccessToken(accessToken);
    accessTokenAth = { ath: accessTokenHash };
  }
  const payload = {
    jti,
    htm: method.toUpperCase(),
    htu: url,
    iat,
    ...accessTokenAth,
  };

  ///4. Encode JWT components
  const encodedHeader = strToBase64Url(JSON.stringify(header));
  const encodedPayload = strToBase64Url(JSON.stringify(payload));

  ///5. Sign JWT
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signingResponse = await signJWT(signingInput);
  if (signingResponse.status !== "success") {
    console.error("Error while signing JWT:", signingResponse);
    return {
      status: "error",
      error: `Error while signing JWT: ${signingResponse}`,
    };
  }
  const encodedSignature = signingResponse.payload.signature;
  const dpopProof = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  return dpopProof;
}
