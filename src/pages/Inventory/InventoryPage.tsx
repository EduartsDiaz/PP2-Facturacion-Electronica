import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import productService from '../../services/products/productService';
import type { Product, MovementType } from '../../types';
import { ProductIcon } from '../../utils/productIcon';

function MovementModal({ products, onClose, onSave }: {
  products: Product[];
  onClose: () => void;
  onSave: (productId: string, qty: number, type: MovementType, reason: string) => void;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { productId: '', quantity: 1, type: 'entrada' as MovementType, reason: '' },
  });
  const selectedId = watch('productId');
  const selectedProduct = products.find(p => p.id === selectedId);

  const submit = (d: { productId: string; quantity: number; type: MovementType; reason: string }) => {
    onSave(d.productId, Number(d.quantity), d.type, d.reason);
  };

  return (
    <div className="modal d-block" style={{ background:'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Registrar movimiento de inventario</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <form onSubmit={handleSubmit(submit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Producto *</label>
                <select className={`form-select ${errors.productId ? 'is-invalid' : ''}`} {...register('productId', { required: 'Seleccione un producto' })}>
                  <option value="">Seleccione...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code}) — Stock: {p.stock}</option>)}
                </select>
                {errors.productId && <div className="invalid-feedback">{errors.productId.message}</div>}
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">Tipo *</label>
                  <select className="form-select" {...register('type')}>
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                    <option value="ajuste">Ajuste (stock exacto)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Cantidad *</label>
                  <input type="number" min="0" className={`form-control ${errors.quantity ? 'is-invalid' : ''}`} {...register('quantity', { required: true, min: 0 })} />
                </div>
              </div>
              <div className="mt-3">
                <label className="form-label fw-semibold">Motivo / Referencia *</label>
                <input className={`form-control ${errors.reason ? 'is-invalid' : ''}`} {...register('reason', { required: 'Ingrese un motivo' })} placeholder="Ej: Compra a proveedor, Ajuste por inventario..." />
                {errors.reason && <div className="invalid-feedback">{errors.reason.message}</div>}
              </div>
              {selectedProduct && (
                <div className="alert alert-info mt-3 py-2 small">
                  Stock actual de <strong>{selectedProduct.name}</strong>: {selectedProduct.stock} {selectedProduct.unit}(s)
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Registrar movimiento</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  entrada: <ArrowDown size={14} className="text-success" />,
  salida:  <ArrowUp size={14} className="text-danger" />,
  ajuste:  <ArrowLeftRight size={14} className="text-info" />,
};
const TYPE_LABEL: Record<string, string> = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste' };

export default function InventoryPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState(() => productService.getAll().filter(p => p.active));
  const [movements, setMovements] = useState(() => productService.getMovements());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const refresh = () => {
    setProducts(productService.getAll().filter(p => p.active));
    setMovements(productService.getMovements());
  };

  const handleSave = (productId: string, qty: number, type: MovementType, reason: string) => {
    if (!session) return;
    productService.adjustStock(productId, qty, type, reason, session);
    toast('Movimiento registrado correctamente', 'success');
    refresh(); setShowModal(false);
  };

  const filtered = useMemo(() => products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  ), [products, search]);

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <span className="badge bg-danger">Agotado</span>;
    if (p.stock <= p.minStock) return <span className="badge bg-warning text-dark">Stock bajo</span>;
    return <span className="badge bg-success">Disponible</span>;
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-0">Inventario</h2>
          <p className="text-muted small mb-0">{products.length} productos activos</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar movimiento
        </button>
      </div>

      {/* Current Stock */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
          <span>Stock actual</span>
          <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
            <span className="input-group-text"><Search size={13} /></span>
            <input className="form-control" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th style={{width:44}}></th><th>Código</th><th>Producto</th><th>Categoría</th><th className="text-center">Stock</th><th className="text-center">Mínimo</th><th className="text-center">Estado</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="ps-2"><ProductIcon name={p.name} description={p.description ?? ''} category={p.category} size={36} fontSize={18} borderRadius={9} /></td>
                  <td className="font-monospace small">{p.code}</td>
                  <td className="fw-semibold">{p.name}</td>
                  <td><span className="badge bg-secondary">{p.category}</span></td>
                  <td className="text-center fw-bold">{p.stock} <span className="text-muted fw-normal small">{p.unit}</span></td>
                  <td className="text-center text-muted small">{p.minStock}</td>
                  <td className="text-center">{stockBadge(p)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-3">Sin resultados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold">Historial de movimientos</div>
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light"><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th className="text-center">Cantidad</th><th className="text-center">Stock ant.</th><th className="text-center">Stock nuevo</th><th>Motivo</th><th>Usuario</th></tr></thead>
            <tbody>
              {movements.slice(0, 50).map(m => (
                <tr key={m.id}>
                  <td className="small text-muted">{new Date(m.createdAt).toLocaleString('es-SV')}</td>
                  <td><span className="d-flex align-items-center gap-1">{TYPE_ICON[m.type]}<span className="small">{TYPE_LABEL[m.type]}</span></span></td>
                  <td className="small">{m.productName}</td>
                  <td className="text-center">{m.quantity}</td>
                  <td className="text-center text-muted">{m.previousStock}</td>
                  <td className="text-center fw-semibold">{m.newStock}</td>
                  <td className="small">{m.reason}</td>
                  <td className="small text-muted">{m.userName}</td>
                </tr>
              ))}
              {movements.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-3">Sin movimientos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <MovementModal products={products} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
