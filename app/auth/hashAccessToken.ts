import * as Crypto from "expo-crypto";

async function hashAccessToken(accessToken: string) {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    accessToken,
    {
      encoding: Crypto.CryptoEncoding.BASE64,
    },
  );

  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export { hashAccessToken };
