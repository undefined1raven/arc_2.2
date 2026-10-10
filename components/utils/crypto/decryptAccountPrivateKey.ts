import * as SecureStore from "expo-secure-store";
import { getAccountEncryptedPrivateKey } from "../constants/secureStoreKeyNames";
import { useActiveUser } from "@/stores/activeUser";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { charCodeArrayToString } from "../fn/charOps";

async function decryptAccountPrivateKey(
  userIdArg?: string | undefined,
): Promise<string | { error: string; status: "error" }> {
  const activeKeyAPI = useActiveKeys.getState();
  const symKey = activeKeyAPI.activeSymmetricKey;
  const userId = useActiveUser.getState().activeUser.userId ?? null;

  if (userId === null && userIdArg === undefined) {
    return { error: "User ID is null", status: "error" };
  }

  if (!symKey) {
    return { error: "Symmetric key is null", status: "error" };
  }

  const encryptedAccountPrivateKey = await SecureStore.getItemAsync(
    getAccountEncryptedPrivateKey(userIdArg ? userIdArg : (userId as string)),
  );

  const cryptoApi = useCryptoOpsQueue.getState();

  const accountPrivateKeyDecryptionRes = await cryptoApi.performOperation(
    "decrypt",
    {
      keyType: "symmetric",
      charCodeData: encryptedAccountPrivateKey,
      key: symKey,
    },
  );

  if (accountPrivateKeyDecryptionRes.status === "error") {
    return { error: "Failed to decrypt account private key", status: "error" };
  }

  try {
    const accountPrivateKeyJWK = charCodeArrayToString(
      JSON.parse("[" + accountPrivateKeyDecryptionRes.payload.decrypted + "]"),
    );
    return accountPrivateKeyJWK;
  } catch (error) {
    console.error("Error parsing decrypted account private key:", error);
    return {
      error: "Failed to parse decrypted account private key",
      status: "error",
    };
  }
}

export { decryptAccountPrivateKey };
