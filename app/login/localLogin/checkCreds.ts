import { decodeWrappedSymkey } from "@/components/utils/encoding/wrappedSymkey";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useActiveKeys } from "@/stores/decryptedKeys";
import { useOfflineLoginTempStore } from "@/stores/offlineLoginTempStore";

///Function used after the backup file is loaded as part of the local login process. It checks whether the PIN and passphrase match the symmetric key backup in the account file.
async function checkCreds(PIKBackup: string) {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const tempLoginStore = useOfflineLoginTempStore.getState();

  if (
    typeof tempLoginStore.passphrase !== "string" ||
    typeof tempLoginStore.pin !== "string"
  ) {
    return false;
  }

  const symmetricKeyDecryptPassword =
    tempLoginStore.pin + tempLoginStore.passphrase;

  const decodedWrappedKey = decodeWrappedSymkey(PIKBackup);

  if (decodedWrappedKey === null) {
    return false;
  }

  const unwrapKeyRes = await cryptoOpsApi.performOperation("unwrapKey", {
    wrappedKey: decodedWrappedKey.wrappedKey,
    salt: decodedWrappedKey.salt,
    iv: decodedWrappedKey.iv,
    password: symmetricKeyDecryptPassword,
  });

  if (unwrapKeyRes.status === "error") {
    return false;
  }

  try {
    const activeKeyAPI = useActiveKeys.getState();
    const symKey = JSON.stringify(unwrapKeyRes.payload.key);
    if (unwrapKeyRes.payload.key.status === "error") {
      return false;
    }
    activeKeyAPI.setActiveSymmetricKey(symKey);
    return true;
  } catch (e) {
    return false;
  }
}

export { checkCreds };
