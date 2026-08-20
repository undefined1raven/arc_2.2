import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveKeys } from "@/stores/decryptedKeys";

type SignResponse =
  | {
      status: "success";
      payload: {
        signature: string;
      };
    }
  | {
      status: "error";
      error: string;
    };

async function privateKeySign(signingInput: string): Promise<SignResponse> {
  const crypoOpsApi = useCryptoOpsQueue.getState();

  const activePrivateKey = useActiveKeys.getState().activePrivateKey;
  if (activePrivateKey === null) {
    console.error("Failed to get private key [KL-343]");
    return { status: "error", error: "No Private Key Found" };
  }

  return crypoOpsApi
    .performOperation("generateDPoPSignature", {
      jwkKeyData: activePrivateKey,
      data: signingInput,
    })
    .then((r) => {
      return r;
    })
    .catch((e) => {
      console.error("Error while signing JWT: ", e);
      return { status: "error", error: e };
    });
}

export { privateKeySign };
