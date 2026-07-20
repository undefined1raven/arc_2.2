import * as Crypto from "expo-crypto";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { stringToCharCodeArray } from "../fn/charOps";

async function createEmptyEncryptedChunkContent(jwkKeyData: string) {
  const cryptoOpsApi = useCryptoOpsQueue.getState();

  const emptyEncryptedArray = await cryptoOpsApi.performOperation("encrypt", {
    keyType: "symmetric",
    key: jwkKeyData,
    charCodeData: stringToCharCodeArray(JSON.stringify([])),
  });

  const emptyEncryptedContent = JSON.stringify(emptyEncryptedArray.payload);

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    emptyEncryptedContent,
  );

  return { content: emptyEncryptedContent, hash: hash };
}

export { createEmptyEncryptedChunkContent };
