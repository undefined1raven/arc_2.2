import { create } from "zustand";
import { nanoid } from "nanoid";

type TransferType = "upload" | "download";
type TaskStatus = "pending" | "in-progress" | "done" | "failed" | "canceled";

interface TransferTask {
  id: string;
  type: TransferType;
  payload: any;
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
    const newTask = { ...task, status: "pending", retries: 0, progress: 0 };
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

  for (let i = 0; i < payload.chunks.length; i++) {
    await uploadChunk(payload.chunks[i]);
    updateTask(task.id, { progress: (i + 1) / payload.chunks.length });
  }
}

async function handleDownload(task: TransferTask) {
  const { updateTask } = useTransferStore.getState();
  const { payload } = task;

  for (let i = 0; i < payload.urls.length; i++) {
    // await downloadChunk(payload.urls[i]);
    updateTask(task.id, { progress: (i + 1) / payload.urls.length });
  }
}
