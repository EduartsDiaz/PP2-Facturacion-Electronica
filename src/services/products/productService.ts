import type { Product, InventoryMovement } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId } from '../../mock/seeds';
import auditService from '../audit/auditService';
import type { AuthSession } from '../../types';

const productService = {
  getAll(): Product[] {
    return storageService.getArray<Product>(KEYS.PRODUCTS)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getActive(): Product[] {
    return this.getAll().filter(p => p.active);
  },

  getById(id: string): Product | null {
    return storageService.getArray<Product>(KEYS.PRODUCTS).find(p => p.id === id) ?? null;
  },

  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, session: AuthSession): Product {
    const product: Product = { ...data, id: createId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    storageService.appendToArray<Product>(KEYS.PRODUCTS, product);
    auditService.log({ userId: session.userId, userName: session.name, action: 'CREATE', module: 'Productos', entityType: 'Product', entityId: product.id, description: `Creó producto: ${product.name}` });
    return product;
  },

  update(id: string, data: Partial<Product>, session: AuthSession): Product | null {
    const arr = storageService.getArray<Product>(KEYS.PRODUCTS);
    const idx = arr.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...arr[idx], ...data, id, updatedAt: new Date().toISOString() };
    arr[idx] = updated;
    storageService.set(KEYS.PRODUCTS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: 'UPDATE', module: 'Productos', entityType: 'Product', entityId: id, description: `Actualizó producto: ${updated.name}` });
    return updated;
  },

  adjustStock(productId: string, qty: number, type: 'entrada'|'salida'|'ajuste', reason: string, session: AuthSession): boolean {
    const arr = storageService.getArray<Product>(KEYS.PRODUCTS);
    const idx = arr.findIndex(p => p.id === productId);
    if (idx === -1) return false;
    const prev = arr[idx].stock;
    let newStock = prev;
    if (type === 'entrada') newStock = prev + qty;
    else if (type === 'salida') newStock = Math.max(0, prev - qty);
    else newStock = qty; // ajuste directo
    arr[idx] = { ...arr[idx], stock: newStock, updatedAt: new Date().toISOString() };
    storageService.set(KEYS.PRODUCTS, arr);
    const mov: InventoryMovement = {
      id: createId(), productId, productName: arr[idx].name,
      type, quantity: qty, previousStock: prev, newStock,
      reason, userId: session.userId, userName: session.name,
      createdAt: new Date().toISOString(),
    };
    storageService.appendToArray<InventoryMovement>(KEYS.INVENTORY, mov);
    auditService.log({ userId: session.userId, userName: session.name, action: 'STOCK_' + type.toUpperCase(), module: 'Inventario', entityType: 'Product', entityId: productId, description: `Mov. ${type} de ${qty} uds. en ${arr[idx].name}. Stock: ${prev}→${newStock}` });
    return true;
  },

  getMovements(): InventoryMovement[] {
    return storageService.getArray<InventoryMovement>(KEYS.INVENTORY)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  setActive(id: string, active: boolean, session: AuthSession): boolean {
    const arr = storageService.getArray<Product>(KEYS.PRODUCTS);
    const idx = arr.findIndex(p => p.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], active, updatedAt: new Date().toISOString() };
    storageService.set(KEYS.PRODUCTS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: active ? 'ACTIVATE' : 'DEACTIVATE', module: 'Productos', entityType: 'Product', entityId: id, description: `${active ? 'Activó' : 'Desactivó'} producto: ${arr[idx].name}` });
    return true;
  },
};

export default productService;
