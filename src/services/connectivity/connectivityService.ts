// ============================================================
// CONNECTIVITY SERVICE — Detección online/offline + cola
// TODO: BACKEND — integrar con sincronización real MH
// ============================================================
import type { OfflineQueueItem } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId } from '../../mock/seeds';

type ConnectivityListener = (online: boolean) => void;
const listeners: ConnectivityListener[] = [];

const connectivityService = {
  isOnline(): boolean {
    const settings = storageService.get<{ simulateOffline?: boolean }>(KEYS.SETTINGS);
    if (settings?.simulateOffline) return false;
    return navigator.onLine;
  },

  subscribe(fn: ConnectivityListener): () => void {
    listeners.push(fn);
    const onOnline = () => fn(this.isOnline());
    const onOffline = () => fn(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  },

  addToQueue(dteId: string): void {
    const item: OfflineQueueItem = {
      id: createId(), dteId, addedAt: new Date().toISOString(), attempts: 0,
    };
    storageService.appendToArray<OfflineQueueItem>(KEYS.OFFLINE_QUEUE, item);
  },

  getQueue(): OfflineQueueItem[] {
    return storageService.getArray<OfflineQueueItem>(KEYS.OFFLINE_QUEUE);
  },

  clearQueue(): void {
    storageService.set(KEYS.OFFLINE_QUEUE, []);
  },

  removeFromQueue(dteId: string): void {
    const q = this.getQueue().filter(i => i.dteId !== dteId);
    storageService.set(KEYS.OFFLINE_QUEUE, q);
  },
};

export default connectivityService;
