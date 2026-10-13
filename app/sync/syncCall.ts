import { syncPull } from "./syncPull";
import { syncPush } from "./syncPush";

let syncPromise: Promise<void> | null = null;

async function syncCall() {
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = (async () => {
    const syncStartTime = Date.now();
    console.info("[SYNC] Started: ", Date());
    await syncPull();
    await syncPush();
    console.info(
      `[SYNC] Finished. Duration: ${(Date.now() - syncStartTime) / 1000}s`,
    );
  })();

  try {
    await syncPromise;
  } finally {
    syncPromise = null;
  }
}

export { syncCall };
