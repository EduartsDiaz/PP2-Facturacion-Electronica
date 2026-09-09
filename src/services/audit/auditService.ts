import type { AuditLog } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId } from '../../mock/seeds';

const auditService = {
  log(params: {
    userId: string; userName: string;
    action: string; module: string;
    entityType: string; entityId: string;
    description: string;
  }): void {
    const entry: AuditLog = {
      id: createId(),
      ...params,
      createdAt: new Date().toISOString(),
    };
    storageService.appendToArray<AuditLog>(KEYS.AUDIT, entry);
  },

  getAll(): AuditLog[] {
    return storageService.getArray<AuditLog>(KEYS.AUDIT)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

export default auditService;
