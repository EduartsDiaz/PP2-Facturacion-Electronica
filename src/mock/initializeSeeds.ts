import storageService, { KEYS } from '../services/storage/storageService';
import { SEED_USERS, SEED_CUSTOMERS, SEED_PRODUCTS, SEED_SETTINGS, buildSeedDTEs } from './seeds';

export function initializeSeeds(): void {
  // Solo inicializar si no hay datos previos
  if (storageService.get(KEYS.USERS)) return;

  storageService.set(KEYS.USERS, SEED_USERS);
  storageService.set(KEYS.CUSTOMERS, SEED_CUSTOMERS);
  storageService.set(KEYS.PRODUCTS, SEED_PRODUCTS);
  storageService.set(KEYS.SETTINGS, SEED_SETTINGS);

  const { sales, dtes, ars, movements, audits } = buildSeedDTEs(
    SEED_CUSTOMERS, SEED_PRODUCTS, SEED_USERS, SEED_SETTINGS
  );

  storageService.set(KEYS.SALES, sales);
  storageService.set(KEYS.DTES, dtes);
  storageService.set(KEYS.AR, ars);
  storageService.set(KEYS.INVENTORY, movements);
  storageService.set(KEYS.AUDIT, audits);
  storageService.set(KEYS.OFFLINE_QUEUE, []);
}
