import type { Customer } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId } from '../../mock/seeds';
import auditService from '../audit/auditService';
import type { AuthSession } from '../../types';

const customerService = {
  getAll(): Customer[] {
    return storageService.getArray<Customer>(KEYS.CUSTOMERS)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getActive(): Customer[] {
    return this.getAll().filter(c => c.active);
  },

  getById(id: string): Customer | null {
    return storageService.getArray<Customer>(KEYS.CUSTOMERS).find(c => c.id === id) ?? null;
  },

  create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, session: AuthSession): Customer {
    const customer: Customer = {
      ...data,
      id: createId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storageService.appendToArray<Customer>(KEYS.CUSTOMERS, customer);
    auditService.log({ userId: session.userId, userName: session.name, action: 'CREATE', module: 'Clientes', entityType: 'Customer', entityId: customer.id, description: `Creó cliente: ${customer.name}` });
    return customer;
  },

  update(id: string, data: Partial<Customer>, session: AuthSession): Customer | null {
    const arr = storageService.getArray<Customer>(KEYS.CUSTOMERS);
    const idx = arr.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...arr[idx], ...data, id, updatedAt: new Date().toISOString() };
    arr[idx] = updated;
    storageService.set(KEYS.CUSTOMERS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: 'UPDATE', module: 'Clientes', entityType: 'Customer', entityId: id, description: `Actualizó cliente: ${updated.name}` });
    return updated;
  },

  deactivate(id: string, session: AuthSession): boolean {
    const arr = storageService.getArray<Customer>(KEYS.CUSTOMERS);
    const idx = arr.findIndex(c => c.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], active: false, updatedAt: new Date().toISOString() };
    storageService.set(KEYS.CUSTOMERS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: 'DEACTIVATE', module: 'Clientes', entityType: 'Customer', entityId: id, description: `Desactivó cliente: ${arr[idx].name}` });
    return true;
  },

  activate(id: string, session: AuthSession): boolean {
    const arr = storageService.getArray<Customer>(KEYS.CUSTOMERS);
    const idx = arr.findIndex(c => c.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], active: true, updatedAt: new Date().toISOString() };
    storageService.set(KEYS.CUSTOMERS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: 'ACTIVATE', module: 'Clientes', entityType: 'Customer', entityId: id, description: `Activó cliente: ${arr[idx].name}` });
    return true;
  },
};

export default customerService;
