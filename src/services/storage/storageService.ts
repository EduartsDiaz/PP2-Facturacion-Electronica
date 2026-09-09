// ============================================================
// STORAGE SERVICE — Capa de abstracción sobre localStorage
// TODO: BACKEND — reemplazar implementación por llamadas REST
// ============================================================

const NAMESPACE = 'epsilon';
const VERSION = 'v1';

function buildKey(entity: string): string {
  return `${NAMESPACE}:${entity}:${VERSION}`;
}

const storageService = {
  get<T>(entity: string): T | null {
    try {
      const raw = localStorage.getItem(buildKey(entity));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set<T>(entity: string, value: T): void {
    try {
      localStorage.setItem(buildKey(entity), JSON.stringify(value));
    } catch (e) {
      console.error(`[storageService] Error writing ${entity}:`, e);
    }
  },

  remove(entity: string): void {
    try {
      localStorage.removeItem(buildKey(entity));
    } catch { /* noop */ }
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(NAMESPACE))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* noop */ }
  },

  // Helpers para arrays
  getArray<T>(entity: string): T[] {
    return this.get<T[]>(entity) ?? [];
  },

  appendToArray<T>(entity: string, item: T): void {
    const arr = this.getArray<T>(entity);
    arr.push(item);
    this.set(entity, arr);
  },

  updateInArray<T extends { id: string }>(entity: string, item: T): boolean {
    const arr = this.getArray<T>(entity);
    const idx = arr.findIndex(i => i.id === item.id);
    if (idx === -1) return false;
    arr[idx] = item;
    this.set(entity, arr);
    return true;
  },

  removeFromArray<T extends { id: string }>(entity: string, id: string): boolean {
    const arr = this.getArray<T>(entity);
    const filtered = arr.filter(i => i.id !== id);
    if (filtered.length === arr.length) return false;
    this.set(entity, filtered);
    return true;
  },
};

export default storageService;

// Claves de entidades
export const KEYS = {
  USERS: 'users',
  SESSION: 'session',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  INVENTORY: 'inventory_movements',
  SALES: 'sales',
  DTES: 'dtes',
  AR: 'accounts_receivable',
  AUDIT: 'audit_logs',
  SETTINGS: 'settings',
  OFFLINE_QUEUE: 'offline_queue',
} as const;
