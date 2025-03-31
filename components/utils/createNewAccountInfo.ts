import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";

function createNewAccountBasics() {
  const cryptoOpsApi = useCryptoOpsQueue.getState();
  const ops: Promise<any>[] = [];
  const newSymmetricKeyPromise = cryptoOpsApi.performOperation(
    "generateSymmetricKey"
  );
  ops.push(newSymmetricKeyPromise);

  cryptoOpsApi
    .performOperation("generateKeyPair")
    .then((r) => console.log("HEY", r))
    .catch((e) => console.log("Error", e));

  //   console.log("Creating new account basics", newSymmetricKeyPromise);

  //   Promise.all(ops)
  //     .then((res) => {
  //       const symmetricKey = res[0].response.payload;
  //       const keyPair = res[1].response.payload;
  //       console.log("New symmetric key", symmetricKey);
  //       console.log("New key pair", keyPair);
  //     })
  //     .catch((e) => {
  //       console.log("Error creating new account basics", e);
  //     });
}

export default createNewAccountBasics;
