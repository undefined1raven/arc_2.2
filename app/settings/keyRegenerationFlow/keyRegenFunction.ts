import { getSymmetricKey } from "@/components/utils/constants/secureStoreKeyNames";
import { encodeWrappedSymkey } from "@/components/utils/encoding/wrappedSymkey";
import { stringToCharCodeArray } from "@/components/utils/fn/charOps";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import * as SecureStore from "expo-secure-store";

async function newKeyPair(symkey: string) {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const plainKey = symkey;

  const newKeyPair = await cryptoOpsApi.performOperation("generateDPoPKeyPair");

  if (newKeyPair.status !== "success") {
    console.error("Failed to generate key pair");
    return { status: "error", error: "FGKP" };
  }

  const newKeyPairData = newKeyPair.payload;
  const privateKey = newKeyPairData.privateKey;
  const publicKey = newKeyPairData.publicKey;

  const encryptedPrivateKeyRes = await cryptoOpsApi.performOperation(
    "encrypt",
    {
      keyType: "symmetric",
      key: plainKey,
      charCodeData: stringToCharCodeArray(privateKey),
    },
  );

  if (encryptedPrivateKeyRes.status !== "success") {
    console.error("Failed to encrypt private key", encryptedPrivateKeyRes);
    return { status: "error", error: "FEPK" };
  }
  const encryptedPrivateKey = JSON.stringify(encryptedPrivateKeyRes.payload);

  return { status: "success", encryptedPrivateKey, publicKey };
}

function updateSymKeyWrap(
  newKeyWrapPassword: string,
  plainKey: string,
): Promise<
  | { status: "error"; error: string }
  | { status: "success"; wrappedSymKey: string }
> {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  return cryptoOpsApi
    .performOperation("wrapKey", {
      password: newKeyWrapPassword,
      jwkKeyData: plainKey,
      keyType: "symmetric",
    })
    .then(async (res) => {
      if (res.status !== "success") {
        return { status: "error", error: "" };
      } else {
        const wrappedSymKey = encodeWrappedSymkey(res.payload);
        if (wrappedSymKey === null) {
          return { status: "error", error: "Sym Key Encode Failed" };
        } else {
          return { status: "success", wrappedSymKey: wrappedSymKey };
        }
      }
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
}

async function basicSecureStoreSave(userId: string, wrappedSymKey: string) {
  console.log("Saving new wrapped symmetric key");
  await SecureStore.setItemAsync(getSymmetricKey(userId), wrappedSymKey);
}

export { updateSymKeyWrap, newKeyPair, basicSecureStoreSave };
