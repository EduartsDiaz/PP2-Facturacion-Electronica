import type { Sale, Product, SaleItem } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId } from '../../mock/seeds';
import productService from '../products/productService';
import auditService from '../audit/auditService';
import type { AuthSession } from '../../types';
import taxCalculationService from '../tax/taxCalculationService';

const salesService = {
  getAll(): Sale[] {
    return storageService.getArray<Sale>(KEYS.SALES)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): Sale | null {
    return storageService.getArray<Sale>(KEYS.SALES).find(s => s.id === id) ?? null;
  },

  buildItem(product: Product, quantity: number, discountCents: number): SaleItem {
    const res = taxCalculationService.calculateLine(
      product.price, quantity, discountCents, product.applyIva
    );
    return {
      productId: product.id, productCode: product.code, productName: product.name,
      quantity, unitPrice: product.price,
      discount: discountCents,
      subtotal: res.subtotal,
      discountTotal: res.discountAmount,
      taxableBase: res.taxableBase,
      iva: res.iva,
      total: res.total,
      applyIva: product.applyIva,
    };
  },

  create(
    data: Omit<Sale, 'id' | 'createdAt' | 'dteId'>,
    session: AuthSession
  ): Sale {
    // Descontar stock
    data.items.forEach(item => {
      productService.adjustStock(item.productId, item.quantity, 'salida', 'Venta registrada', session);
    });

    const sale: Sale = {
      ...data,
      id: createId(),
      dteId: null,
      createdAt: new Date().toISOString(),
    };
    storageService.appendToArray<Sale>(KEYS.SALES, sale);
    auditService.log({
      userId: session.userId, userName: session.name,
      action: 'CREATE', module: 'Ventas', entityType: 'Sale', entityId: sale.id,
      description: `Venta por ${taxCalculationService.formatCurrency(sale.total)} a ${sale.customerName}`,
    });
    return sale;
  },

  linkDTE(saleId: string, dteId: string): void {
    const arr = storageService.getArray<Sale>(KEYS.SALES);
    const idx = arr.findIndex(s => s.id === saleId);
    if (idx !== -1) {
      arr[idx] = { ...arr[idx], dteId };
      storageService.set(KEYS.SALES, arr);
    }
  },

  getTodaySales(): Sale[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.getAll().filter(s => s.createdAt.startsWith(today));
  },

  getMonthSales(): Sale[] {
    const month = new Date().toISOString().slice(0, 7);
    return this.getAll().filter(s => s.createdAt.startsWith(month));
  },
};

export default salesService;
