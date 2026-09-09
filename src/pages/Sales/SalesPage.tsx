import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/products/productService';
import customerService from '../../services/customers/customerService';
import salesService from '../../services/sales/salesService';
import dteService from '../../services/dte/dteService';
import arService from '../../services/ar/arService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import connectivityService from '../../services/connectivity/connectivityService';
import storageService, { KEYS } from '../../services/storage/storageService';
import type { Product, Customer, SaleItem, DteType, PaymentMethod, CompanySettings } from '../../types';
import { ProductIcon } from '../../utils/productIcon';

interface CartItem extends SaleItem { product: Product }

function CartRow({ item, onQty, onDiscount, onRemove }: { item: CartItem; onQty: (delta: number) => void; onDiscount: (v: number) => void; onRemove: () => void }) {
  return (
    <tr>
      <td>
        <div className="fw-semibold small">{item.productName}</div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{item.productCode}</div>
      </td>
      <td className="text-end small">{taxCalculationService.formatCurrency(item.unitPrice)}</td>
      <td>
        <div className="d-flex align-items-center gap-1">
          <button className="btn btn-sm btn-outline-secondary p-0 px-1" onClick={() => onQty(-1)} disabled={item.quantity <= 1} aria-label="Reducir cantidad"><Minus size={12}/></button>
          <span className="px-2 fw-semibold">{item.quantity}</span>
          <button className="btn btn-sm btn-outline-secondary p-0 px-1" onClick={() => onQty(1)} disabled={item.quantity >= item.product.stock + item.quantity} aria-label="Aumentar cantidad"><Plus size={12}/></button>
        </div>
      </td>
      <td>
        <input
          type="number" min="0" max="100" step="0.01"
          className="form-control form-control-sm text-end"
          style={{ width: 80 }}
          value={taxCalculationService.toDollars(item.discount / item.quantity)}
          onChange={e => onDiscount(Math.round(parseFloat(e.target.value || '0') * 100))}
          title="Descuento por unidad ($)"
          aria-label="Descuento unitario"
        />
      </td>
      <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(item.total)}</td>
      <td>
        <button className="btn btn-sm btn-outline-danger p-0 px-1" onClick={onRemove} aria-label={`Eliminar ${item.productName}`}><Trash2 size={14}/></button>
      </td>
    </tr>
  );
}

const CATEGORIES = ['Todos','Electrónica','Alimentos','Limpieza','Papelería','Herramientas','Farmacia','Tecnología','Ropa'];

export default function SalesPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const { isOnline, refreshQueue } = useConnectivity();
  const navigate = useNavigate();

  const [products] = useState(() => productService.getActive());
  const [customers] = useState(() => customerService.getActive());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'cart' | 'confirm' | 'success'>('cart');
  const [dteType, setDteType] = useState<DteType>('factura');
  const [processing, setProcessing] = useState(false);
  const [lastDteId, setLastDteId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    return (cat === 'Todos' || p.category === cat) &&
           (!q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }), [products, search, cat]);

  const totals = useMemo(() => taxCalculationService.calculateTotals(cart), [cart]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) { toast('Sin stock disponible', 'warning'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast('Stock insuficiente', 'warning'); return prev; }
        return prev.map(i => i.productId === product.id ? rebuildItem(i, i.product, i.quantity + 1, i.discount / i.quantity) : i);
      }
      const item = buildCartItem(product, 1, 0);
      return [...prev, item];
    });
  }, [toast]);

  function buildCartItem(product: Product, qty: number, discPerUnit: number): CartItem {
    const discTotal = Math.round(discPerUnit * qty);
    const res = taxCalculationService.calculateLine(product.price, qty, discTotal, product.applyIva);
    return {
      product, productId: product.id, productCode: product.code, productName: product.name,
      quantity: qty, unitPrice: product.price, discount: discPerUnit,
      subtotal: res.subtotal, discountTotal: res.discountAmount,
      taxableBase: res.taxableBase, iva: res.iva, total: res.total, applyIva: product.applyIva,
    };
  }

  function rebuildItem(item: CartItem, product: Product, qty: number, discPerUnit: number): CartItem {
    return buildCartItem(product, qty, Math.round(discPerUnit * 100));
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty < 1) return i;
      if (delta > 0 && i.quantity >= i.product.stock) { toast('Stock insuficiente', 'warning'); return i; }
      return buildCartItem(i.product, newQty, i.discount / i.quantity * 100 / 100);
    }));
  };

  const updateDiscount = (productId: string, discPerUnit: number) => {
    setCart(prev => prev.map(i => i.productId !== productId ? i : buildCartItem(i.product, i.quantity, discPerUnit)));
  };

  const removeItem = (productId: string) => setCart(prev => prev.filter(i => i.productId !== productId));

  const handleConfirm = async () => {
    if (!session || !selectedCustomer) return;
    setProcessing(true);
    try {
      const settings = storageService.get<CompanySettings>(KEYS.SETTINGS);
      if (!settings) throw new Error('Sin configuración');

      const sale = salesService.create({
        customerId: selectedCustomer.id, customerName: selectedCustomer.name,
        items: cart.map(i => ({ productId: i.productId, productCode: i.productCode, productName: i.productName,
          quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount,
          subtotal: i.subtotal, discountTotal: i.discountTotal, taxableBase: i.taxableBase,
          iva: i.iva, total: i.total, applyIva: i.applyIva })),
        subtotal: totals.subtotal, totalDiscount: totals.totalDiscount,
        taxableBase: totals.taxableBase, iva: totals.iva, total: totals.total,
        paymentMethod, userId: session.userId, userName: session.name, notes,
      }, session);

      // Generar DTE
      let dte = dteService.generateDTE(sale, dteType, selectedCustomer, settings);
      dte = dteService.simulateDigitalSignature(dte);
      dte = await dteService.simulateTransmission(dte);
      dteService.save(dte);
      dteService.incrementCounter(dteType);
      salesService.linkDTE(sale.id, dte.id);

      // Cola offline
      if (!isOnline) {
        connectivityService.addToQueue(dte.id);
        refreshQueue();
        toast('Sin conexión. DTE guardado en cola de contingencia. SIMULACIÓN', 'warning');
      } else {
        toast('Venta y DTE generados correctamente. SIMULACIÓN', 'success');
      }

      // A/R si es crédito
      if (paymentMethod === 'credito') {
        const due = new Date(); due.setDate(due.getDate() + 30);
        arService.create({
          customerId: selectedCustomer.id, customerName: selectedCustomer.name,
          dteId: dte.id, dteControlNumber: dte.controlNumber,
          issueDate: dte.createdAt, dueDate: due.toISOString(),
          amount: totals.total, paid: 0, balance: totals.total, status: 'pendiente',
        });
      }

      setLastDteId(dte.id);
      setStep('success');
    } catch (e) {
      toast('Error al procesar la venta', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const resetSale = () => {
    setCart([]); setSelectedCustomer(null); setPaymentMethod('efectivo');
    setNotes(''); setStep('cart'); setLastDteId(null); setDteType('factura');
  };

  if (step === 'success') {
    return (
      <div className="p-4 text-center">
        <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 480 }}>
          <div className="card-body py-5">
            <div className="text-success mb-3" style={{ fontSize: 56 }}>✓</div>
            <h3 className="fw-bold">¡Venta completada!</h3>
            <p className="text-muted">DTE generado — {isOnline ? 'transmitido' : 'en cola de contingencia'}</p>
            <p className="text-warning small fw-semibold">SIMULACIÓN — No es un DTE real del Ministerio de Hacienda</p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <button className="btn btn-primary" onClick={() => lastDteId && navigate(`/dte/${lastDteId}`)}>Ver DTE</button>
              <button className="btn btn-outline-secondary" onClick={resetSale}>Nueva venta</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep('cart')}>&larr; Volver</button>
          <h2 className="h4 fw-bold mb-0">Confirmar emisión de DTE</h2>
        </div>
        <div className="row g-3">
          <div className="col-md-7">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold">Resumen de venta</div>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light"><tr><th>Producto</th><th className="text-center">Qty</th><th className="text-end">Subtotal</th><th className="text-end">IVA</th><th className="text-end">Total</th></tr></thead>
                  <tbody>
                    {cart.map(i => <tr key={i.productId}>
                      <td className="small">{i.productName}</td>
                      <td className="text-center">{i.quantity}</td>
                      <td className="text-end small">{taxCalculationService.formatCurrency(i.taxableBase)}</td>
                      <td className="text-end small">{taxCalculationService.formatCurrency(i.iva)}</td>
                      <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(i.total)}</td>
                    </tr>)}
                  </tbody>
                  <tfoot className="table-light">
                    <tr><td colSpan={3} className="text-end small text-muted">Base imponible</td><td colSpan={2} className="text-end">{taxCalculationService.formatCurrency(totals.taxableBase)}</td></tr>
                    <tr><td colSpan={3} className="text-end small text-muted">IVA (13%)</td><td colSpan={2} className="text-end">{taxCalculationService.formatCurrency(totals.iva)}</td></tr>
                    <tr><td colSpan={3} className="text-end fw-bold">TOTAL</td><td colSpan={2} className="text-end fw-bold fs-5">{taxCalculationService.formatCurrency(totals.total)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Tipo de documento</h6>
                <div className="d-flex flex-column gap-2">
                  {(['factura', 'ccf'] as DteType[]).map(t => (
                    <div key={t} className="form-check">
                      <input type="radio" className="form-check-input" id={`dt-${t}`} value={t} checked={dteType === t} onChange={() => setDteType(t)} />
                      <label htmlFor={`dt-${t}`} className="form-check-label">
                        {t === 'factura' ? 'Factura de Consumidor Final' : 'Comprobante de Crédito Fiscal (CCF)'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="fw-semibold mb-2">Cliente</h6>
                <div className="fw-semibold">{selectedCustomer?.name}</div>
                <div className="text-muted small">{selectedCustomer?.nit}</div>
              </div>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-semibold mb-2">Método de pago</h6>
                <select className="form-select form-select-sm mb-2" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="credito">Crédito (A/C)</option>
                </select>
              </div>
            </div>
            {!isOnline && (
              <div className="alert alert-warning mt-2 py-2 small">
                Sin conexión — DTE se guardará en modo contingencia. SIMULACIÓN
              </div>
            )}
            <div className="alert alert-info mt-2 py-2 small">
              <strong>SIMULACIÓN</strong> — Este DTE no tiene validez fiscal real. Pendiente de integración con el Ministerio de Hacienda.
            </div>
            <button className="btn btn-primary w-100 mt-2 py-2" onClick={handleConfirm} disabled={processing}>
              {processing && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />}
              {processing ? 'Procesando...' : 'Confirmar y emitir DTE'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h2 className="h4 fw-bold mb-0">Punto de venta</h2>
        {cart.length > 0 && (
          <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => setCart([])}>
            <Trash2 size={14} /> Vaciar carrito
          </button>
        )}
      </div>

      <div className="row g-3" style={{ minHeight: 500 }}>
        {/* Products panel */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body pb-2">
              <div className="d-flex gap-2 mb-2">
                <div className="input-group input-group-sm flex-grow-1">
                  <span className="input-group-text"><Search size={13}/></span>
                  <input className="form-control" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
                  {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><X size={13}/></button>}
                </div>
              </div>
              <div className="d-flex gap-1 flex-wrap mb-2">
                {CATEGORIES.map(c => (
                  <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 480 }}>
              <div className="row g-2 px-3 pb-3">
                {filteredProducts.length === 0 && <div className="text-center text-muted py-4">Sin resultados</div>}
                {filteredProducts.map(p => (
                  <div key={p.id} className="col-6 col-md-4">
                    <div
                      className={`card h-100 border product-card ${p.stock === 0 ? 'opacity-50' : 'cursor-pointer'}`}
                      onClick={() => p.stock > 0 && addToCart(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && p.stock > 0 && addToCart(p)}
                      aria-label={`Agregar ${p.name} al carrito`}
                    >
                      <div className="card-body p-0">
                        {/* Product icon */}
                        <div style={{ display:'flex', justifyContent:'center', padding:'12px 8px 8px' }}>
                          <ProductIcon name={p.name} description={p.description ?? ''} category={p.category} size={52} fontSize={26} borderRadius={14} />
                        </div>
                        <div className="px-2 pb-2">
                          <div className="small fw-semibold mb-1 lh-tight text-center" style={{ fontSize:'0.72rem' }}>{p.name}</div>
                          <div className="fw-bold text-primary text-center" style={{ fontSize:'0.85rem' }}>{taxCalculationService.formatCurrency(p.price)}</div>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            {p.applyIva ? <span className="badge bg-info" style={{ fontSize:'0.58rem' }}>+IVA</span> : <span className="badge bg-light text-dark" style={{ fontSize:'0.58rem' }}>Exento</span>}
                            <span className={`badge ${p.stock === 0 ? 'bg-danger' : p.stock <= p.minStock ? 'bg-warning text-dark' : 'bg-success'}`} style={{ fontSize:'0.58rem' }}>
                              {p.stock === 0 ? 'Agotado' : `${p.stock}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cart panel */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100 d-flex flex-column">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <span className="fw-semibold d-flex align-items-center gap-2"><ShoppingCart size={16}/> Carrito</span>
              <span className="badge bg-primary">{cart.length} ítems</span>
            </div>

            {/* Customer selector */}
            <div className="px-3 pt-2">
              <label className="form-label fw-semibold small mb-1">Cliente *</label>
              <select className="form-select form-select-sm mb-2" value={selectedCustomer?.id ?? ''}
                onChange={e => setSelectedCustomer(customers.find(c => c.id === e.target.value) ?? null)}>
                <option value="">Seleccione cliente...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Items */}
            <div className="flex-grow-1 overflow-auto px-3">
              {cart.length === 0 && (
                <div className="text-center text-muted py-5">
                  <ShoppingCart size={40} className="mb-2 opacity-25" />
                  <div>Agrega productos al carrito</div>
                </div>
              )}
              {cart.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light"><tr><th>Producto</th><th className="text-end">P.U.</th><th>Qty</th><th>Desc.$</th><th className="text-end">Total</th><th></th></tr></thead>
                    <tbody>
                      {cart.map(item => (
                        <CartRow key={item.productId} item={item}
                          onQty={d => updateQty(item.productId, d)}
                          onDiscount={v => updateDiscount(item.productId, v)}
                          onRemove={() => removeItem(item.productId)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="border-top px-3 pt-2 pb-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Subtotal</span><span>{taxCalculationService.formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="d-flex justify-content-between small text-danger mb-1">
                    <span>Descuentos</span><span>-{taxCalculationService.formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Base imponible</span><span>{taxCalculationService.formatCurrency(totals.taxableBase)}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>IVA (13%)</span><span>{taxCalculationService.formatCurrency(totals.iva)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>TOTAL</span><span className="text-primary">{taxCalculationService.formatCurrency(totals.total)}</span>
                </div>
                <button
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setStep('confirm')}
                  disabled={!selectedCustomer || cart.length === 0}
                >
                  Continuar <ChevronRight size={16} />
                </button>
                {!selectedCustomer && <div className="text-danger small mt-1 text-center">Seleccione un cliente para continuar</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
