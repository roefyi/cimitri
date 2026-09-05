const DB_NAME = 'cimitri-offline';
const STORE = 'actions';

export type OfflineAction =
  | { id: string; kind: 'complete'; jobId: string; complete: boolean }
  | { id: string; kind: 'flag'; jobId: string; note: string };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueue(action: OfflineAction): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(action);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listQueue(): Promise<OfflineAction[]> {
  const db = await openDb();
  const items = await new Promise<OfflineAction[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as OfflineAction[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return items;
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function flushQueue(): Promise<{ flushed: number; failed: number }> {
  const items = await listQueue();
  let flushed = 0;
  let failed = 0;
  for (const item of items) {
    try {
      const res = await fetch(`/api/jobs/${item.jobId}/crew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('request failed');
      await removeFromQueue(item.id);
      flushed += 1;
    } catch {
      failed += 1;
    }
  }
  return { flushed, failed };
}

const JOBS_CACHE_KEY = 'cimitri-crew-jobs';

export function cacheCrewJobs(payload: unknown): void {
  try {
    localStorage.setItem(JOBS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function readCachedCrewJobs<T>(): T | null {
  try {
    const raw = localStorage.getItem(JOBS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
