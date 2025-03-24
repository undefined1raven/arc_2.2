import { BackgroundTaskRunner } from "./LocalWebView";
import { cryptoOpsQueue, useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
function CryptoWorkers() {
  const cryptoOpsApi = useCryptoOpsQueue();

  return (
    <>
      {cryptoOpsApi.queue.map((op, ix) => {
        return (
          <BackgroundTaskRunner
            key={op.requestId}
            requestId={op.requestId}
            code={{ type: op.type, args: op.args }}
          ></BackgroundTaskRunner>
        );
      })}
    </>
  );
}

export { CryptoWorkers };
