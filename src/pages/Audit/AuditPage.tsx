import React, { useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import auditService from '../../services/audit/auditService';

const MODULE_COLORS: Record<string, string> = {
  Ventas: 'primary', Clientes: 'info', Productos: 'success',
  Inventario: 'warning', DTE: 'secondary', Usuarios: 'danger', Configuración: 'dark',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const logs = useMemo(() => auditService.getAll(), []);

  const modules = [...new Set(logs.map(l => l.module))].sort();

  const filtered = useMemo(() => logs.filter(l => {
    const q = search.toLowerCase();
    return (!q || l.description.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q)) &&
           (!filterModule || l.module === filterModule);
  }), [logs, search, filterModule]);

  return (
    <div className="p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Shield size={28} className="text-primary" />
        <div>
          <h2 className="h4 fw-bold mb-0">Auditoría del sistema</h2>
          <p className="text-muted small mb-0">Registro de acciones de usuarios — solo lectura</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-5">
              <input className="form-control form-control-sm" placeholder="Buscar por descripción o usuario..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
                <option value="">Todos los módulos</option>
                {modules.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light">
              <tr><th>Fecha / Hora</th><th>Usuario</th><th className="text-center">Módulo</th><th className="text-center">Acción</th><th>Descripción</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">Sin registros</td></tr>}
              {filtered.map(l => (
                <tr key={l.id}>
                  <td className="small text-muted text-nowrap">{new Date(l.createdAt).toLocaleString('es-SV')}</td>
                  <td className="small fw-semibold">{l.userName}</td>
                  <td className="text-center">
                    <span className={`badge bg-${MODULE_COLORS[l.module] ?? 'secondary'}`}>{l.module}</span>
                  </td>
                  <td className="text-center"><span className="badge bg-light text-dark border">{l.action}</span></td>
                  <td className="small">{l.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length > 0 && (
          <div className="card-footer bg-white small text-muted">{filtered.length} de {logs.length} registros</div>
        )}
      </div>
    </div>
  );
}
