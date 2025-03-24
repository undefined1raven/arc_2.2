import { create } from "zustand";
import { v4 } from "uuid";
type CryptoOpType =
  | "encrypt"
  | "decrypt"
  | "generateKeyPair"
  | "generateSymmetricKey"
  | "exportKey"
  | "importKey"
  | "wrapKey"
  | "unwrapKey";

interface ICryptoOp {
  requestId: string;
  type: CryptoOpType;
  args:
    | EncryptArgs
    | DecryptArgs
    | GenerateKeyPairArgs
    | GenerateSymmetricKeyArgs
    | ExportKeyArgs
    | ImportKeyArgs
    | WrapKeyArgs
    | UnwrapKeyArgs
    | undefined;
}

interface EncryptArgs {
  charCodeData: string;
  key: CryptoKey;
  keyType: "public" | "symmetric";
}

interface DecryptArgs {
  data: string;
  key: string;
}

type GenerateKeyPairArgs = undefined;

type GenerateSymmetricKeyArgs = undefined;

interface ExportKeyArgs {
  key: string;
  format: string;
}

interface ErrorResponse {
  status: "error";
  payload: { message: string; providedArgs: any };
}

interface ExportKeyResponseArgs {
  status: "success" | "error";
  payload: { jwk: string };
}

interface ImportKeyResponseArgs {
  status: "success" | "error";
  payload: { key: CryptoKey };
}

type GenerateKeyPairResponse =
  | ErrorResponse
  | {
      status: "success";
      payload: {
        publicKey: string;
        privateKey: string;
      };
    };

interface ImportKeyArgs {
  jwkKeyData: string;
  keyType: "private" | "symmetric" | "public";
}

interface WrapKeyArgs {
  key: string;
  password: string;
  salt: string;
  iv: string;
}

interface UnwrapKeyArgs {
  wrappedKey: string;
  password: string;
  salt: string;
  iv: string;
}
export interface cryptoOpsQueue {
  queue: ICryptoOp[];
  responsePromises: Record<
    string,
    {
      resolve: (response: ICryptoOpResponse) => void;
      reject: (error: any) => void;
    }
  >;
  enqueue: (op: ICryptoOp) => void;
  dequeue: (response: ICryptoOpResponse) => void;
  clear: () => void;
  performOperation: (
    type: CryptoOpType,
    args?: ICryptoOp["args"]
  ) => Promise<ICryptoOpResponse>;
  addResponsePromise: (
    requestId: string,
    resolve: (response: ICryptoOpResponse) => void,
    reject: (error: any) => void
  ) => void;
  removeResponsePromise: (requestId: string) => void;
}

export interface ICryptoOpResponse {
  requestId: string;
  response: { status: "success" | "error"; payload: any };
}

const useCryptoOpsQueue = create<cryptoOpsQueue>((set, get) => ({
  queue: [],
  responsePromises: {},
  addResponsePromise: (
    requestId: string,
    resolve: (response: ICryptoOpResponse) => void,
    reject: (error: any) => void
  ) => {
    set((state) => ({
      ...state,
      responsePromises: {
        ...state.responsePromises,
        [requestId]: { resolve, reject },
      },
    }));
  },
  removeResponsePromise: (requestId: string) => {
    set((state) => {
      const { [requestId]: _, ...rest } = state.responsePromises;
      return { ...state, responsePromises: rest };
    });
  },
  enqueue: (op: ICryptoOp) => set((state) => ({ queue: [...state.queue, op] })),
  dequeue: (response: ICryptoOpResponse) => {
    const { queue, responsePromises } = get();
    const opPromise = responsePromises[response.requestId];
    if (opPromise) {
      opPromise.resolve(response);
      get().removeResponsePromise(response.requestId);
    } else {
      console.error("No promise found for requestId", response.requestId);
    }
    const newQueue = queue.filter((op) => op.requestId !== response.requestId);
    set({ queue: newQueue });
  },
  performOperation: (type: CryptoOpType, args: any) => {
    const requestId = v4();
    const op: ICryptoOp = { requestId, type, args };
    const promise = new Promise<ICryptoOpResponse>((resolve, reject) => {
      get().addResponsePromise(requestId, resolve, reject);
    });
    get().enqueue(op);
    return promise;
  },
  clear: () => set({ queue: [] }),
}));

export { useCryptoOpsQueue };
