import {
  FeatureConfigTypeNames,
  FeatureTableType,
} from "@/constants/CommonTypes";
import { create } from "zustand";

export type OutboxItem = {
  mutation_id: string;
  account_id: string;
  device_id: string;
  feature: string;
  chunk_id: string;
  base_hash: string | null;
  hash: string;
  encrypted_content: string;
  updated_at: number;
  time_range_start?: number; //Used by the timeTracking and dayPlanner features
  time_range_end?: number;
  type?: string; // Used by the featureConfigChunks
  version: string;
};

export type SyncOpsItem = {
  id: string;
  mutation_id: string;
  chunk_id: string;
  user_id: string;
  encrypted_content: string;
  tx: number;
  time_range_start?: number;
  hash: string;
  time_range_end?: number;
  feature_config_type?: FeatureConfigTypeNames;
  version: string;
  feature_table: FeatureTableType;
};

export type MutationServerResponse = {
  commitResults: {
    success: boolean;
    commited: OutboxItem[];
    conflicts: OutboxItem[];
  }[];
  lastCursor: number;
};

export type CursorRow = {
  account_id: string;
  device_id: string;
  cursor: number;
  updated_at: number;
};

type OutboxState = {
  outbox: OutboxItem[];
  cursor: number | null;
  setCursor: (cursor: number) => void;
  setOutbox: (outbox: OutboxItem[]) => void;
  appendOutbox: (item: OutboxItem) => void;
  removeItemFromOutbox: (mutation_id: string) => void;
};

export const useOutboxStore = create<OutboxState>((set) => ({
  outbox: [],
  cursor: null,
  setCursor: (cursor) => set(() => ({ cursor })),
  setOutbox: (outbox) => set(() => ({ outbox })),
  appendOutbox: (item) => set((state) => ({ outbox: [...state.outbox, item] })),
  removeItemFromOutbox: (mutation_id) =>
    set((state) => ({
      outbox: state.outbox.filter((i) => i.mutation_id !== mutation_id),
    })),
}));

export default useOutboxStore;
