import type { AccountReceivable } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId } from '../../mock/seeds';

const arService = {
  getAll(): AccountReceivable[] {
    const now = new Date().toISOString();
    return storageService.getArray<AccountReceivable>(KEYS.AR)
      .map(ar => {
        // recalcular estado por vencimiento
        if (ar.status !== 'pagado') {
          if (ar.balance <= 0) return { ...ar, status: 'pagado' as const };
          if (ar.dueDate < now && ar.status === 'pendiente') return { ...ar, status: 'vencido' as const };
        }
        return ar;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  create(data: Omit<AccountReceivable, 'id' | 'createdAt' | 'updatedAt'>): AccountReceivable {
    const ar: AccountReceivable = { ...data, id: createId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    storageService.appendToArray<AccountReceivable>(KEYS.AR, ar);
    return ar;
  },

  registerPayment(id: string, amount: number): AccountReceivable | null {
    const arr = storageService.getArray<AccountReceivable>(KEYS.AR);
    const idx = arr.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const ar = arr[idx];
    const newPaid = ar.paid + amount;
    const newBalance = Math.max(0, ar.amount - newPaid);
    const status: AccountReceivable['status'] = newBalance === 0 ? 'pagado' : newPaid > 0 ? 'parcial' : 'pendiente';
    arr[idx] = { ...ar, paid: newPaid, balance: newBalance, status, updatedAt: new Date().toISOString() };
    storageService.set(KEYS.AR, arr);
    return arr[idx];
  },
};

export default arService;
