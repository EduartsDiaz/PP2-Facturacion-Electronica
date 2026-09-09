import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, Send, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import dteService from '../../services/dte/dteService';
import connectivityService from '../../services/connectivity/connectivityService';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import taxCalculationService from '../../services/tax/taxCalculationService';
import type { DTE } from '../../types';

const TYPE_LABELS: Record<string, string> = { factura: 'Factura', ccf: 'CCF', nota_credito: 'Nota de Crédito', nota_debito: 'Nota de Débito' };
const MODE_LABELS: Record<string, string> = { NORMAL: 'Normal', CONTINGENCIA: 'Contingencia' };

export default function DTEPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOnline, queueCount, processQueue, refreshQueue } = useConnectivity();

  const [dtes, setDtes] = useState(() => dteService.getAll());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [confirmAnul, setConfirmAnul] = useState<DTE | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 15;

  const refresh = () => setDtes(dteService.getAll());

  const filtered = useMemo(() => dtes.filter(d => {
    const q = search.toLowerCase();
    const match = !q || d.controlNumber.toLowerCase().includes(q) || d.receiver.name.toLowerCase().includes(q) || d.generationCode.toLowerCase().includes(q);
    const mStatus = !filterStatus || d.status === filterStatus;
    const mType = !filterType || d.type === filterType;
    return match && mStatus && mType;
  }), [dtes, search, filterStatus, filterType]);

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleSimTransmit = async (dte: DTE) => {
    if (!isOnline) { toast('Sin conexión. Documento en cola de contingencia.', 'warning'); return; }
    const updated = await dteService.simulateTransmission(dte);
    dteService.update(updated);
    refresh();
    toast(`DTE ${dte.controlNumber} transmitido. SIMULACIÓN`, 'success');
  };

  const handleAnul = () => {
    if (!confirmAnul) return;
    const updated = { ...confirmAnul, status: 'anulado' as const, updatedAt: new Date().toISOString() };
    dteService.update(updated);
    refresh(); setConfirmAnul(null);
    toast('Documento anulado. SIMULACIÓN', 'warning');
  };

  const handleSync = async () => {
    const count = await processQueue();
    refresh();
    toast(`${count} documentos sincronizados. SIMULACIÓN`, 'success');
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-0">Facturación Electrónica</h2>
          <p className="text-muted small mb-0">SIMULACIÓN — No integrado con Ministerio de Hacienda</p>
        </div>
        {queueCount > 0 && (
          <button className="btn btn-warning btn-sm d-flex align-items-center gap-2" onClick={handleSync}>
            <Send size={14} /> Sincronizar cola ({queueCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text"><Search size={13}/></span>
                <input className="form-control" placeholder="Buscar por N° control, receptor, código..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><X size={13}/></button>}
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}>
                <option value="">Todos los estados</option>
                <option value="transmitido">Transmitido</option>
                <option value="pendiente_transmision">Pend. transmisión</option>
                <option value="contingencia">Contingencia</option>
                <option value="rechazado">Rechazado</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0); }}>
                <option value="">Todos los tipos</option>
                <option value="factura">Factura</option>
                <option value="ccf">CCF</option>
                <option value="nota_credito">Nota crédito</option>
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
                <th>Fecha</th><th>Tipo</th><th>N° Control</th>
                <th>Receptor</th><th className="text-end">Total</th>
                <th className="text-center">Modo</th><th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-4">No se encontraron documentos</td></tr>}
              {paginated.map(d => (
                <tr key={d.id}>
                  <td className="small text-muted">{d.emissionDate}</td>
                  <td><span className="badge bg-secondary">{TYPE_LABELS[d.type] ?? d.type}</span></td>
                  <td><span className="font-monospace small">{d.controlNumber}</span></td>
                  <td>
                    <div className="small fw-semibold">{d.receiver.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{d.receiver.nit}</div>
                  </td>
                  <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(d.summary.total)}</td>
                  <td className="text-center">
                    <span className={`badge ${d.emissionMode === 'CONTINGENCIA' ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                      {MODE_LABELS[d.emissionMode]}
                    </span>
                  </td>
                  <td className="text-center"><StatusBadge status={d.status} /></td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center flex-wrap">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/dte/${d.id}`)} title="Ver documento" aria-label={`Ver ${d.controlNumber}`}><Eye size={13}/></button>
                      {(d.status === 'pendiente_transmision' || d.status === 'contingencia') && (
                        <button className="btn btn-sm btn-outline-success" onClick={() => handleSimTransmit(d)} title="Simular transmisión" aria-label="Simular transmisión"><Send size={13}/></button>
                      )}
                      {d.status !== 'anulado' && d.status !== 'rechazado' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmAnul(d)} title="Anular" aria-label={`Anular ${d.controlNumber}`}><X size={13}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="card-footer d-flex align-items-center justify-content-between bg-white">
            <span className="small text-muted">{filtered.length} documentos · página {page + 1} de {totalPages}</span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!confirmAnul}
        title="Anular documento"
        message={`¿Confirma anular el documento ${confirmAnul?.controlNumber}? Esta acción no puede deshacerse.`}
        confirmLabel="Anular"
        variant="danger"
        onConfirm={handleAnul}
        onCancel={() => setConfirmAnul(null)}
      />
    </div>
  );
}
