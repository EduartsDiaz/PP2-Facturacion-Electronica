import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import productService from '../../services/products/productService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import type { Product } from '../../types';
import { ProductIcon } from '../../utils/productIcon';

const CATEGORIES = ['Electrónica','Alimentos','Limpieza','Papelería','Herramientas','Farmacia','Tecnología','Ropa','Otros'];
const UNITS = ['unidad','caja','kg','litro','metro','par','paquete','docena','servicio'] as const;

const schema = z.object({
  code: z.string().min(3, 'Mínimo 3 caracteres'),
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string(),
  category: z.string().min(1, 'Seleccione categoría'),
  price: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Precio inválido'),
  applyIva: z.boolean(),
  stock: z.coerce.number().int().min(0, 'No puede ser negativo'),
  minStock: z.coerce.number().int().min(0, 'No puede ser negativo'),
  unit: z.enum(UNITS),
  active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function ProductModal({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: (d: FormData, id?: string) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: product
      ? { ...product, price: taxCalculationService.toDollars(product.price).toFixed(2) }
      : { code:'', name:'', description:'', category:'', price:'0.00', applyIva:true, stock:0, minStock:5, unit:'unidad', active:true },
  });

  return (
    <div className="modal d-block" style={{ background:'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{product ? 'Editar producto' : 'Nuevo producto'}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <form onSubmit={handleSubmit(d => onSave(d, product?.id))}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Código *</label>
                  <input className={`form-control font-monospace ${errors.code?'is-invalid':''}`} {...register('code')} placeholder="PROD-001" />
                  {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Nombre *</label>
                  <input className={`form-control ${errors.name?'is-invalid':''}`} {...register('name')} placeholder="Nombre del producto" />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={2} {...register('description')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Categoría *</label>
                  <select className={`form-select ${errors.category?'is-invalid':''}`} {...register('category')}>
                    <option value="">Seleccione...</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Precio (USD) *</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input type="number" step="0.01" min="0" className={`form-control ${errors.price?'is-invalid':''}`} {...register('price')} />
                  </div>
                  {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Unidad</label>
                  <select className="form-select" {...register('unit')}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Stock actual</label>
                  <input type="number" min="0" className={`form-control ${errors.stock?'is-invalid':''}`} {...register('stock')} />
                  {errors.stock && <div className="invalid-feedback">{errors.stock.message}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Stock mínimo</label>
                  <input type="number" min="0" className={`form-control ${errors.minStock?'is-invalid':''}`} {...register('minStock')} />
                </div>
                <div className="col-md-3 d-flex align-items-end pb-1">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="applyIva" {...register('applyIva')} />
                    <label htmlFor="applyIva" className="form-check-label fw-semibold">Aplica IVA (13%)</label>
                  </div>
                </div>
                <div className="col-md-3 d-flex align-items-end pb-1">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="pActive" {...register('active')} />
                    <label htmlFor="pActive" className="form-check-label fw-semibold">Activo</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar producto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState(() => productService.getAll());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState<Product | null | 'new'>(null);

  const refresh = () => setProducts(productService.getAll());
  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) &&
           (!filterCat || p.category === filterCat);
  }), [products, search, filterCat]);

  const handleSave = (data: FormData, id?: string) => {
    if (!session) return;
    const payload = { ...data, price: Math.round(parseFloat(data.price as unknown as string) * 100) };
    if (id) { productService.update(id, payload as Partial<Product>, session); toast('Producto actualizado', 'success'); }
    else { productService.create(payload as Omit<Product,'id'|'createdAt'|'updatedAt'>, session); toast('Producto creado correctamente', 'success'); }
    refresh(); setModal(null);
  };

  const toggleActive = (p: Product) => {
    if (!session) return;
    productService.setActive(p.id, !p.active, session);
    toast(`Producto ${!p.active ? 'activado' : 'desactivado'}`, 'info');
    refresh();
  };

  const stockStatus = (p: Product) => {
    if (p.stock === 0) return <span className="badge bg-danger">Agotado</span>;
    if (p.stock <= p.minStock) return <span className="badge bg-warning text-dark">Stock bajo</span>;
    return <span className="badge bg-success">Disponible</span>;
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-0">Productos</h2>
          <p className="text-muted small mb-0">{filtered.length} de {products.length} productos</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setModal('new')}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text"><Search size={14} /></span>
                <input className="form-control" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><X size={14}/></button>}
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="">Todas las categorías</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{width:44}}></th><th>Código</th><th>Producto</th><th>Categoría</th>
                <th className="text-end">Precio</th><th className="text-center">IVA</th>
                <th className="text-center">Stock</th><th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Sin resultados</td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="ps-2"><ProductIcon name={p.name} description={p.description ?? ''} category={p.category} size={36} fontSize={18} borderRadius={9} /></td>
                  <td className="font-monospace small">{p.code}</td>
                  <td>
                    <div className="fw-semibold">{p.name}</div>
                    <div className="text-muted small">{p.description}</div>
                  </td>
                  <td><span className="badge bg-secondary">{p.category}</span></td>
                  <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(p.price)}</td>
                  <td className="text-center">
                    {p.applyIva ? <span className="badge bg-info">13%</span> : <span className="badge bg-light text-dark">Exento</span>}
                  </td>
                  <td className="text-center">
                    <div>{stockStatus(p)}</div>
                    <small className="text-muted">{p.stock} / mín {p.minStock}</small>
                    {p.stock <= p.minStock && p.active && <AlertTriangle size={12} className="text-warning ms-1" />}
                  </td>
                  <td className="text-center">{p.active ? <span className="badge bg-success">Activo</span> : <span className="badge bg-secondary">Inactivo</span>}</td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setModal(p)} aria-label={`Editar ${p.name}`}><Edit2 size={14}/></button>
                      <button className={`btn btn-sm btn-outline-${p.active ? 'warning' : 'success'}`} onClick={() => toggleActive(p)} aria-label={p.active ? 'Desactivar' : 'Activar'}>
                        {p.active ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
