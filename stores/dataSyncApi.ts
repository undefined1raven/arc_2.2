import { create } from "zustand";
import { nanoid } from "nanoid";
import * as Crypto from "expo-crypto";
import { authenticatedApiRequest } from "@/components/utils/api/apiRequest";
import { useActiveUser } from "./activeUser";
import { deviceId } from "@/components/utils/constants/secureStoreKeyNames";
import * as SecureStore from "expo-secure-store";
import { ARC_ChunksType } from "@/constants/CommonTypes";
import * as SQLite from "expo-sqlite";
import { getLocalCache } from "@/components/utils/localDb";

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
    task: Omit<TransferTask, "status" | "retries" | "progress">,
  ) => void;
  runNext: () => Promise<void>;
  updateTask: (id: string, updates: Partial<TransferTask>) => void;
  cancelTask: (id: string) => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  tasks: [],
  activeCount: 0,
  maxConcurrent: 3, // limit number of simultaneous uploads/downloads

  enqueue: (
    task:
      | Omit<TransferTask, "status" | "retries" | "progress">
      | Omit<TransferTask, "status" | "retries" | "progress">[],
  ) => {
    const currentTasks = get().tasks;
    if (Array.isArray(task)) {
      const newTasks = task.map((t) => ({
        ...t,
        status: "pending" as TaskStatus,
        retries: 0,
        progress: 0,
        id: Crypto.randomUUID(),
      }));

      set((state) => ({ tasks: [...currentTasks, ...newTasks] }));
      get().runNext();
    } else {
      const newTask = {
        ...task,
        status: "pending",
        retries: 0,
        progress: 0,
        id: Crypto.randomUUID(),
      };

      set((state) => ({ tasks: [...currentTasks, newTask] }));
      get().runNext();
    }
  },

  runNext: async () => {
    const { tasks, activeCount, maxConcurrent } = get();
    if (activeCount >= maxConcurrent) return; // wait until one finishes

    const nextTask = tasks.find((t) => t.status === "pending");
    if (!nextTask) return; // no pending task left

    const currentTasks = get().tasks;

    // Mark as running
    set((state) => ({
      activeCount: state.activeCount + 1,
      tasks: currentTasks.map((t) =>
        t.id === nextTask.id ? { ...t, status: "in-progress" } : t,
      ),
    }));

    try {
      if (nextTask.type === "upload") {
        await handleUpload(nextTask);
      } else {
        await handleDownload(nextTask);
      }
      get().updateTask(nextTask.id, { status: "done", progress: 1 });
    } catch (err) {
      console.log("Task failed:", nextTask.id, err);
      get().updateTask(nextTask.id, {
        status: "failed",
        error: String(err),
      });
    } finally {
      console.log("Finalizing task:", nextTask.id);
      set((state) => ({ activeCount: state.activeCount - 1 }));
      get().runNext(); // trigger next one
    }
  },

  updateTask: (id, updates) => {
    const currentTasks = get().tasks;
    const newTasks = [];

    for (let ix = 0; ix < currentTasks.length; ix++) {
      const task = currentTasks[ix];
      if (task.id === id) {
        newTasks.push({ ...task, ...updates });
      } else {
        newTasks.push(task);
      }
    }

    set((state) => ({
      tasks: newTasks,
    }));
  },

  cancelTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "canceled" } : t,
      ),
    }));
  },
}));

// Example handlers
async function handleUpload(task: TransferTask) {
  const { updateTask } = useTransferStore.getState();
  const { payload } = task;

  console.log("Uploading chunk:", payload.id);

  const activeUserId = useActiveUser.getState().activeUser.userId;
  const currentDeviceId = SecureStore.getItem(deviceId);

  updateTask(task.id, { progress: 0.5 });

  authenticatedApiRequest("/dataSync/updateChunk", {
    deviceId: currentDeviceId,
    accountId: activeUserId,
    ...payload,
  });
}

async function handleDownload(task: TransferTask) {
  const { updateTask } = useTransferStore.getState();
  const payload = task.downloadPayload;
  if (payload === undefined || payload?.id === undefined) {
    console.error("Invalid payload for download task:", task.payload);
    updateTask(task.id, { status: "failed", error: "Invalid payload" });
    return;
  }
  const activeUserId = useActiveUser.getState().activeUser.userId;
  const currentDeviceId = SecureStore.getItem(deviceId);
  updateTask(task.id, { progress: 0.5 });
  console.log("Downloading chunk w payload:", JSON.stringify(task.payload));
  const downloadResponse = await authenticatedApiRequest(
    "/dataSync/downloadChunk",
    {
      deviceId: currentDeviceId,
      accountId: activeUserId,
      ...payload,
    },
  );
  const responseData = downloadResponse.data;
  if (
    typeof responseData.tableName !== "string" ||
    responseData.chunk === undefined ||
    responseData.status !== "success"
  ) {
    console.error("Failed to download chunk:", responseData);
  } else {
    const { tableName } = responseData;
    const validTables = [
      "timeTrackingChunks",
      "dayPlannerChunks",
      "personalDiaryChunks",
      "featureConfigChunks",
      "personalDiaryGroups",
    ];
    if (validTables.includes(tableName) === false) {
      console.error("Invalid table name in downloaded chunk:", tableName);
    }
    const saveResults = await saveDownloadedChunkToDB(
      responseData.chunk,
      tableName as string,
    );
    console.log("Saved downloaded chunk results:", saveResults);
  }
}

async function saveDownloadedChunkToDB(
  chunkData: ARC_ChunksType,
  tableName: string,
) {
  const db = await getLocalCache();
  const commonReuqirements = [
    "id",
    "userID",
    "encryptedContent",
    "tx",
    "version",
    "hash",
  ];
  const tableKeyReqs = {
    timeTrackingChunks: [
      ...commonReuqirements,
      "timeRangeStart",
      "timeRangeEnd",
    ],
    dayPlannerChunks: [...commonReuqirements, "timeRangeStart", "timeRangeEnd"],
    personalDiaryChunks: [...commonReuqirements],
    featureConfigChunks: [...commonReuqirements, "type"],
    personalDiaryGroups: [...commonReuqirements],
  };

  const requiredKeys = tableKeyReqs[tableName as keyof typeof tableKeyReqs];

  for (const key of requiredKeys) {
    if (!(key in chunkData)) {
      return { status: "error", error: `Missing key ${key} in chunk data` };
    }
  }

  const placeholders = requiredKeys.map(() => "?").join(", ");
  const values = requiredKeys.map((key) => (chunkData as any)[key]);

  const query = `INSERT OR REPLACE INTO ${tableName} (${requiredKeys.join(
    ", ",
  )}) VALUES (${placeholders});`;

  try {
    await db.runAsync(query, values);
    return { status: "success" };
  } catch (error) {
    return { status: "error", error: String(error) };
  }
}

export type { TransferTask };
