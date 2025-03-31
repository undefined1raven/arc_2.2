import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { v4 } from "uuid";

function createEmptyChunk(
  idPrefix: string,
  tableName: string,
  userId: string,
  firstEntry: any
) {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const data = [firstEntry];
  const stringifiedData = JSON.stringify(data);
  return {
    id: idPrefix + "-" + v4(),
    userID: userId,
    encryptedContent: "",
    tx: Date.now(),
    version: "1",
  };
}

export { createEmptyChunk };
