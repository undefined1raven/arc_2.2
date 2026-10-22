import { useStatusIndicatorStore } from "@/stores/statusIndicatorStore";
import { syncPull } from "./syncPull";
import { syncPush } from "./syncPush";
import debounce from "lodash.debounce";

let syncPromise: Promise<void> | null = null;
let rerunRequested = false;

async function performSync(): Promise<void> {
  const statusIndicatorApi = useStatusIndicatorStore.getState();
  const syncStartTime = Date.now();

  console.info("[SYNC] Started:", new Date());

  try {
    statusIndicatorApi.setIsDownloadingFromRemoteStorage(true);
    await syncPull();

    statusIndicatorApi.setIsDownloadingFromRemoteStorage(false);
    statusIndicatorApi.setIsUploadingToRemoteStorage(true);
    await syncPush();

    console.info(
      `[SYNC] Finished. Duration: ${(Date.now() - syncStartTime) / 1000}s`,
    );
  } finally {
    statusIndicatorApi.setIsDownloadingFromRemoteStorage(false);
    statusIndicatorApi.setIsUploadingToRemoteStorage(false);
  }
}

const debouncedSync = debounce(() => {
  if (syncPromise) {
    rerunRequested = true;
    return;
  }

  syncPromise = (async () => {
    do {
      rerunRequested = false;
      console.log("[SYNC] Rerun requested");
      await performSync();
    } while (rerunRequested);
  })().finally(() => {
    syncPromise = null;
  });
}, 500);

function syncCall() {
  debouncedSync();
}

export { syncCall };
