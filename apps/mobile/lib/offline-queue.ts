import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "ferm.offline-queue";

export interface OfflineOperation {
  id: string;
  kind: "ansitz" | "fallwild" | "kontrolle";
  title: string;
  createdAt: string;
  status: "pending" | "syncing" | "failed";
}

const seedQueue: OfflineOperation[] = [
  {
    id: "queue-1",
    kind: "fallwild",
    title: "Fallwild L127 mit 2 Fotos",
    createdAt: "2026-04-03T07:00:00+02:00",
    status: "pending"
  }
];

export async function readOfflineQueue(): Promise<OfflineOperation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedQueue));
    return seedQueue;
  }

  return JSON.parse(raw) as OfflineOperation[];
}

export async function enqueueOfflineOperation(operation: OfflineOperation) {
  const queue = await readOfflineQueue();
  const nextQueue = [operation, ...queue];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextQueue));
  return nextQueue;
}
