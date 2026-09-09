import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import customerService from '../../services/customers/customerService';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import type { Customer } from '../../types';
import { CustomerAvatar } from '../../utils/productIcon';

const SV_DEPARTMENTS = ['Ahuachapán','Cabañas','Chalatenango','Cuscatlán','La Libertad','La Paz','La Unión','Morazán','San Miguel','San Salvador','San Vicente','Santa Ana','Sonsonate','Usulután'];

const schema = z.object({
  personType: z.enum(['natural','juridica']),
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  nit: z.string().regex(/^\d{4}-\d{6}-\d{3}-\d$/, 'Formato: XXXX-XXXXXX-XXX-X'),
  nrc: z.string(),
  dui: z.string(),
  email: z.string().email('Correo inválido').or(z.literal('')),
  phone: z.string(),
  address: z.string().min(5, 'Dirección requerida'),
  department: z.string().min(1, 'Seleccione departamento'),
  municipality: z.string().min(2, 'Municipio requerido'),
  taxpayerType: z.enum(['grande','mediano','pequeño','excluido']),
  ivaExempt: z.boolean(),
  active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function CustomerModal({ customer, onClose, onSave }: { customer: Customer | null; onClose: () => void; onSave: (d: FormData, id?: string) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: customer ?? { personType: 'juridica', name: '', nit: '', nrc: '', dui: '', email: '', phone: '', address: '', department: 'San Salvador', municipality: '', taxpayerType: 'mediano', ivaExempt: false, active: true },
  });

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{customer ? 'Editar cliente' : 'Nuevo cliente'}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <form onSubmit={handleSubmit(d => onSave(d, customer?.id))}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo de persona *</label>
                  <select className="form-select" {...register('personType')}>
                    <option value="natural">Persona Natural</option>
                    <option value="juridica">Persona Jurídica</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Nombre / Razón social *</label>
                  <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name')} placeholder="Nombre completo o razón social" />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">NIT * <span className="text-muted fw-normal small">(fiscal)</span></label>
                  <input className={`form-control font-monospace ${errors.nit ? 'is-invalid' : ''}`} {...register('nit')} placeholder="0000-000000-000-0" />
                  {errors.nit && <div className="invalid-feedback">{errors.nit.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">NRC <span className="text-muted fw-normal small">(fiscal)</span></label>
                  <input className="form-control font-monospace" {...register('nrc')} placeholder="0000000-0" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">DUI</label>
                  <input className="form-control font-monospace" {...register('dui')} placeholder="00000000-0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Correo electrónico</label>
                  <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} type="email" {...register('email')} placeholder="correo@ejemplo.com" />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Teléfono</label>
                  <input className="form-control" {...register('phone')} placeholder="2222-3333" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Dirección *</label>
                  <input className={`form-control ${errors.address ? 'is-invalid' : ''}`} {...register('address')} placeholder="Dirección completa" />
                  {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Departamento *</label>
                  <select className={`form-select ${errors.department ? 'is-invalid' : ''}`} {...register('department')}>
                    <option value="">Seleccione...</option>
                    {SV_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  {errors.department && <div className="invalid-feedback">{errors.department.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Municipio *</label>
                  <input className={`form-control ${errors.municipality ? 'is-invalid' : ''}`} {...register('municipality')} placeholder="Municipio" />
                  {errors.municipality && <div className="invalid-feedback">{errors.municipality.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de contribuyente <span className="text-muted fw-normal small">(fiscal)</span></label>
                  <select className="form-select" {...register('taxpayerType')}>
                    <option value="grande">Gran contribuyente</option>
                    <option value="mediano">Mediano contribuyente</option>
                    <option value="pequeño">Pequeño contribuyente</option>
                    <option value="excluido">Excluido</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end pb-1">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="ivaExempt" {...register('ivaExempt')} />
                    <label htmlFor="ivaExempt" className="form-check-label fw-semibold">Exento de IVA</label>
                  </div>
                </div>
                <div className="col-md-3 d-flex align-items-end pb-1">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="active" {...register('active')} />
                    <label htmlFor="active" className="form-check-label fw-semibold">Activo</label>
                  </div>
                </div>
              </div>
              <div className="alert alert-info mt-3 py-2 small">
                <strong>Nota:</strong> Los datos fiscales (NIT, NRC) son críticos para la emisión de DTE. Verificar antes de guardar.
                {/* TODO: BACKEND — validar NIT contra tabla de contribuyentes del MH */}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar cliente</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { session } = useAuth();
  const isContador = session?.role === 'contador';
  const { toast } = useToast();
  const [customers, setCustomers] = useState(() => customerService.getAll());
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalCustomer, setModalCustomer] = useState<Customer | null | 'new'>(null);
  const [confirm, setConfirm] = useState<{ id: string; name: string; active: boolean } | null>(null);

  const filtered = useMemo(() => customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.nit.includes(q) || c.email.toLowerCase().includes(q);
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? c.active : !c.active);
    return matchSearch && matchActive;
  }), [customers, search, filterActive]);

  const refresh = () => setCustomers(customerService.getAll());

  const handleSave = (data: FormData, id?: string) => {
    if (!session) return;
    if (id) {
      customerService.update(id, data as Partial<Customer>, session);
      toast('Cliente actualizado correctamente', 'success');
    } else {
      customerService.create(data as Omit<Customer, 'id'|'createdAt'|'updatedAt'>, session);
      toast('Cliente creado correctamente', 'success');
    }
    refresh(); setModalCustomer(null);
  };

  const handleToggle = (c: Customer) => setConfirm({ id: c.id, name: c.name, active: c.active });
  const confirmToggle = () => {
    if (!confirm || !session) return;
    if (confirm.active) { customerService.deactivate(confirm.id, session); toast('Cliente desactivado', 'warning'); }
    else { customerService.activate(confirm.id, session); toast('Cliente activado', 'success'); }
    refresh(); setConfirm(null);
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-0">Clientes</h2>
          <p className="text-muted small mb-0">{filtered.length} de {customers.length} clientes</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setModalCustomer('new')} style={isContador ? {display:'none'} : {}}>
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text"><Search size={14} /></span>
                <input className="form-control" placeholder="Buscar por nombre, NIT o correo..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><X size={14} /></button>}
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterActive} onChange={e => setFilterActive(e.target.value as 'all'|'active'|'inactive')}>
                <option value="all">Todos los estados</option>
                <option value="active">Solo activos</option>
                <option value="inactive">Solo inactivos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre / Razón social</th>
                <th>NIT</th>
                <th>Tipo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">No se encontraron clientes</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <CustomerAvatar name={c.name} size={36} />
                      <div>
                        <div className="fw-semibold">{c.name}</div>
                        <div className="text-muted small">{c.personType === 'juridica' ? 'Jurídica' : 'Natural'} · {c.taxpayerType}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-monospace small">{c.nit}</span></td>
                  <td><span className="badge bg-secondary">{c.ivaExempt ? 'Exento IVA' : 'Gravado'}</span></td>
                  <td className="small">{c.email || '—'}</td>
                  <td className="small">{c.phone || '—'}</td>
                  <td className="text-center"><StatusBadge status={c.active ? 'active' : 'inactive'} /></td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      {!isContador && <button className="btn btn-sm btn-outline-primary" onClick={() => setModalCustomer(c)} title="Editar" aria-label={`Editar ${c.name}`}>
                        <Edit2 size={14} />
                      </button>}
                      {!isContador && <button className={`btn btn-sm btn-outline-${c.active ? 'warning' : 'success'}`} onClick={() => handleToggle(c)} title={c.active ? 'Desactivar' : 'Activar'} aria-label={`${c.active ? 'Desactivar' : 'Activar'} ${c.name}`}>
                        {c.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>}
                      {isContador && <span className="text-muted small" style={{fontSize:12}}>Solo lectura</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalCustomer && (
        <CustomerModal
          customer={modalCustomer === 'new' ? null : modalCustomer}
          onClose={() => setModalCustomer(null)}
          onSave={handleSave}
        />
      )}
      <ConfirmModal
        show={!!confirm}
        title={confirm?.active ? 'Desactivar cliente' : 'Activar cliente'}
        message={`¿Confirma ${confirm?.active ? 'desactivar' : 'activar'} al cliente "${confirm?.name}"?`}
        confirmLabel={confirm?.active ? 'Desactivar' : 'Activar'}
        variant={confirm?.active ? 'warning' : 'success'}
        onConfirm={confirmToggle}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
