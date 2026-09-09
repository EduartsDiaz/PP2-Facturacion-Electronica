// ============================================================
// TAX CALCULATION SERVICE — Motor fiscal IVA El Salvador
// Trabaja internamente en centavos para evitar errores float
// TODO: BACKEND — validar con normativa oficial MH vigente
// ============================================================
import type { TaxLineResult, TaxTotals, SaleItem } from '../../types';

const IVA_RATE = 0.13; // 13% — configurable por settings

const taxCalculationService = {
  /**
   * Calcula impuestos de una línea de producto
   * @param unitPriceCents  Precio unitario en centavos
   * @param quantity        Cantidad (entero)
   * @param discountCents   Descuento total en centavos
   * @param applyIva        Si el producto lleva IVA
   * @param ivaRate         Tasa de IVA (default 0.13)
   */
  calculateLine(
    unitPriceCents: number,
    quantity: number,
    discountCents: number,
    applyIva: boolean,
    ivaRate: number = IVA_RATE
  ): TaxLineResult {
    const subtotal = Math.round(unitPriceCents * quantity);
    const discountAmount = Math.min(discountCents, subtotal);
    const taxableBase = subtotal - discountAmount;
    const iva = applyIva ? Math.round(taxableBase * ivaRate) : 0;
    const total = taxableBase + iva;
    return { subtotal, discountAmount, taxableBase, iva, total };
  },

  /**
   * Calcula totales del carrito
   */
  calculateTotals(items: SaleItem[]): TaxTotals {
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const totalDiscount = items.reduce((s, i) => s + i.discountTotal, 0);
    const taxableBase = items.reduce((s, i) => s + i.taxableBase, 0);
    const iva = items.reduce((s, i) => s + i.iva, 0);
    const total = taxableBase + iva;
    return { subtotal, totalDiscount, taxableBase, iva, total };
  },

  /**
   * Formatea centavos a string de dólares
   */
  formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  },

  /**
   * Parsea string de dólares a centavos
   */
  parseToCents(dollars: string | number): number {
    const val = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
    return Math.round((isNaN(val) ? 0 : val) * 100);
  },

  /**
   * Centavos a número decimal para mostrar
   */
  toDollars(cents: number): number {
    return cents / 100;
  },
};

export default taxCalculationService;
