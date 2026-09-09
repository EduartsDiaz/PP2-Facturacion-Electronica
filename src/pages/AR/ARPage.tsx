import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, DollarSign } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import arService from '../../services/ar/arService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import StatusBadge from '../../components/common/StatusBadge';
import type { AccountReceivable } from '../../types';

function PaymentModal({ ar, onClose, onSave }: { ar: AccountReceivable; onClose: () => void; onSave: (amount: number) => void }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const maxCents = ar.balance;

  const submit = () => {
    const c = Math.round(parseFloat(amount) * 100);
    if (isNaN(c) || c <= 0 || c > maxCents) { setError(`Monto inválido. Máximo: ${taxCalculationService.formatCurrency(maxCents)}`); return; }
    onSave(c);
  };

  return (
    <div className="modal d-block" style={{ background:'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Registrar pago</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <div className="modal-body">
            <p className="small text-muted">Cliente: <strong>{ar.customerName}</strong></p>
            <p className="small text-muted">Saldo pendiente: <strong>{taxCalculationService.formatCurrency(ar.balance)}</strong></p>
            <div className="mb-3">
              <label className="form-label fw-semibold">Monto pagado (USD)</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input type="number" step="0.01" min="0.01" className={`form-control ${error ? 'is-invalid' : ''}`}
                  value={amount} onChange={e => { setAmount(e.target.value); setError(''); }} />
              </div>
              {error && <div className="text-danger small mt-1">{error}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-success" onClick={submit}>Registrar pago</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ARPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ars, setArs] = useState(() => arService.getAll());
  const [filterStatus, setFilterStatus] = useState('');
  const [payModal, setPayModal] = useState<AccountReceivable | null>(null);

  const refresh = () => setArs(arService.getAll());

  const filtered = useMemo(() => ars.filter(a => !filterStatus || a.status === filterStatus), [ars, filterStatus]);

  const totals = useMemo(() => ({
    total: filtered.reduce((s, a) => s + a.amount, 0),
    paid: filtered.reduce((s, a) => s + a.paid, 0),
    balance: filtered.reduce((s, a) => s + a.balance, 0),
  }), [filtered]);

  const handlePayment = (amount: number) => {
    if (!payModal) return;
    arService.registerPayment(payModal.id, amount);
    toast(`Pago de ${taxCalculationService.formatCurrency(amount)} registrado`, 'success');
    refresh(); setPayModal(null);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="h4 fw-bold mb-0">Cuentas por Cobrar</h2>
        <p className="text-muted small mb-0">Seguimiento de facturas a crédito</p>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total facturado', value: taxCalculationService.formatCurrency(totals.total), cls: 'primary' },
          { label: 'Total cobrado', value: taxCalculationService.formatCurrency(totals.paid), cls: 'success' },
          { label: 'Saldo pendiente', value: taxCalculationService.formatCurrency(totals.balance), cls: 'warning' },
          { label: 'Documentos', value: String(filtered.length), cls: 'info' },
        ].map(c => (
          <div key={c.label} className="col-6 col-md-3">
            <div className={`card border-0 shadow-sm border-start border-${c.cls} border-3`}>
              <div className="card-body py-3">
                <div className="text-muted small">{c.label}</div>
                <div className="fw-bold fs-5">{c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <select className="form-select form-select-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Pago parcial</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Cliente</th><th>Documento</th><th>Emisión</th><th>Vencimiento</th>
                <th className="text-end">Monto</th><th className="text-end">Cobrado</th>
                <th className="text-end">Saldo</th><th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Sin registros</td></tr>}
              {filtered.map(ar => (
                <tr key={ar.id}>
                  <td className="fw-semibold small">{ar.customerName}</td>
                  <td><span className="font-monospace small">{ar.dteControlNumber}</span></td>
                  <td className="small text-muted">{ar.issueDate.slice(0,10)}</td>
                  <td className={`small ${ar.status === 'vencido' ? 'text-danger fw-semibold' : 'text-muted'}`}>{ar.dueDate.slice(0,10)}</td>
                  <td className="text-end">{taxCalculationService.formatCurrency(ar.amount)}</td>
                  <td className="text-end text-success">{taxCalculationService.formatCurrency(ar.paid)}</td>
                  <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(ar.balance)}</td>
                  <td className="text-center"><StatusBadge status={ar.status} /></td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/dte/${ar.dteId}`)} title="Ver DTE"><Eye size={13}/></button>
                      {ar.status !== 'pagado' && (
                        <button className="btn btn-sm btn-outline-success" onClick={() => setPayModal(ar)} title="Registrar pago" aria-label="Registrar pago"><DollarSign size={13}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && <PaymentModal ar={payModal} onClose={() => setPayModal(null)} onSave={handlePayment} />}
    </div>
  );
}
