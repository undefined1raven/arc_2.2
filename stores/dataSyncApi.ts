import { create } from "zustand";
import { nanoid } from "nanoid";
import * as Crypto from "expo-crypto";
import { authenticatedApiRequest } from "@/components/utils/api/apiRequest";
import { useActiveUser } from "./activeUser";
import { deviceId } from "@/components/utils/constants/secureStoreKeyNames";
import * as SecureStore from "expo-secure-store";

type TransferType = "upload" | "download";
type TaskStatus = "pending" | "in-progress" | "done" | "failed" | "canceled";

interface IPayloadItem {
  tableName:
    | "dayPlanner"
    | "timeTracking"
    | "personalDiary"
    | "personalDiaryGroups"
    | "featureConfig";
  encryptedContent?: string;
  id: string; ///Chunk id
  hash: string;
  tx: number;
}

interface TransferTask {
  id: string;
  type: TransferType;
  payload: IPayloadItem;
  status: TaskStatus;
  retries: number;
  progress: number;
  error?: string;
}

interface TransferState {
  tasks: TransferTask[];
  activeCount: number;
  maxConcurrent: number;
  enqueue: (
    task: Omit<TransferTask, "status" | "retries" | "progress">
  ) => void;
  runNext: () => Promise<void>;
  updateTask: (id: string, updates: Partial<TransferTask>) => void;
  cancelTask: (id: string) => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  tasks: [],
  activeCount: 0,
  maxConcurrent: 3, // limit number of simultaneous uploads/downloads

  enqueue: (task) => {
    const newTask = {
      ...task,
      status: "pending",
      retries: 0,
      progress: 0,
      id: Crypto.randomUUID(),
    };
    console.log("Enqueuing task:", newTask.id);
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    get().runNext();
  },

  runNext: async () => {
    const { tasks, activeCount, maxConcurrent } = get();
    if (activeCount >= maxConcurrent) return; // wait until one finishes

    const nextTask = tasks.find((t) => t.status === "pending");
    if (!nextTask) return; // no pending task left

    // Mark as running
    set((state) => ({
      activeCount: state.activeCount + 1,
      tasks: state.tasks.map((t) =>
        t.id === nextTask.id ? { ...t, status: "in-progress" } : t
      ),
    }));

    try {
      if (nextTask.type === "upload") await handleUpload(nextTask);
      else await handleDownload(nextTask);

      get().updateTask(nextTask.id, { status: "done", progress: 1 });
    } catch (err) {
      get().updateTask(nextTask.id, {
        status: "failed",
        error: String(err),
      });
    } finally {
      set((state) => ({ activeCount: state.activeCount - 1 }));
      get().runNext(); // trigger next one
    }
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  cancelTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "canceled" } : t
      ),
    }));
  },
}));

// Example handlers
async function handleUpload(task: TransferTask) {
  const { updateTask } = useTransferStore.getState();
  const { payload } = task;

  console.log("Uploading chunk:", payload.id);
  // Simulate upload with timeout

  const activeUserId = useActiveUser.getState().activeUser.userId;
  const currentDeviceId = SecureStore.getItem(deviceId);

  authenticatedApiRequest("/dataSync/updateChunk", {
    deviceId: currentDeviceId,
    accountId: activeUserId,
    ...payload,
  });
}

async function handleDownload(task: TransferTask) {
  const { updateTask } = useTransferStore.getState();
  const { payload } = task;
}

export type { TransferTask };
