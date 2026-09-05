import { useOutboxStore } from "../../stores/sync/outbox";

async function syncPush() {
  const outboxStore = useOutboxStore();
  const currentOutbox = outboxStore.outbox;
}

export { syncPush };
