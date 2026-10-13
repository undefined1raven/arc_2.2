import { OutboxItem, SyncOpsItem } from "@/stores/sync/outbox";

type CreateChallengeResponse = {
  challenge: string;
};

type VerifyChallengeResponse = {
  token: string;
};

type SyncPullResponse = {
  maxRemoteCursor: number;
  mutations: SyncOpsItem[];
};

export { CreateChallengeResponse, VerifyChallengeResponse, SyncPullResponse };
