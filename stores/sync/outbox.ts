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
