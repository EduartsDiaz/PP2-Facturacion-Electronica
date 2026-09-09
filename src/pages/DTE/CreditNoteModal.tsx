import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import dteService from '../../services/dte/dteService';
import salesService from '../../services/sales/salesService';
import storageService, { KEYS } from '../../services/storage/storageService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import type { DTE, CompanySettings } from '../../types';
import { createId } from '../../mock/seeds';

const REASONS = [
  'Error en precio','Devolución de mercancía','Descuento no aplicado','Error en cantidad',
  'Cancelación de servicio','Ajuste de facturación','Otro',
];

interface Props { dte: DTE; onClose: () => void; onCreated: (dte: DTE) => void; }

export default function CreditNoteModal({ dte, onClose, onCreated }: Props) {
  const { session } = useAuth();
  const [reason, setReason] = useState(REASONS[0]);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const maxAmount = dte.summary.total;

  const handleCreate = async () => {
    if (!session) return;
    const amtCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amtCents) || amtCents <= 0 || amtCents > maxAmount) {
      setError(`Monto inválido. Máximo: ${taxCalculationService.formatCurrency(maxAmount)}`);
      return;
    }
    setProcessing(true);
    try {
      const settings = storageService.get<CompanySettings>(KEYS.SETTINGS);
      if (!settings) throw new Error('Sin configuración');

      // Build a credit note sale
      const cnSale = salesService.getAll().find(s => s.id === dte.saleId);
      if (!cnSale) throw new Error('Venta no encontrada');

      const proportion = amtCents / maxAmount;
      const adjItems = dte.items.map(item => ({
        ...item,
        subtotal: Math.round(item.subtotal * proportion),
        discountTotal: Math.round(item.discountTotal * proportion),
        taxableBase: Math.round(item.taxableBase * proportion),
        iva: Math.round(item.iva * proportion),
        total: Math.round(item.total * proportion),
      }));

      const cnTotals = taxCalculationService.calculateTotals(adjItems);
      const controlNumber = dteService.getNextControlNumber('nota_credito', settings);
      const genCode = createId().replace(/-/g,'').toUpperCase().slice(0,32);
      const now = new Date();

      const cn: DTE = {
        id: createId(), type: 'nota_credito',
        controlNumber, generationCode: genCode,
        emissionDate: now.toISOString().slice(0,10),
        emissionTime: now.toISOString().slice(11,19),
        emitter: dte.emitter, receiver: dte.receiver,
        items: adjItems,
        summary: { subtotal: cnTotals.subtotal, totalDiscount: cnTotals.totalDiscount, taxableBase: cnTotals.taxableBase, iva: cnTotals.iva, total: cnTotals.total },
        status: 'generado', emissionMode: 'NORMAL',
        signed: true, signatureSimulated: `SIM-NC-${genCode.slice(0,12)}`,
        transmitted: false, transmittedAt: null,
        saleId: dte.saleId, relatedDteId: dte.id,
        creditNoteReason: reason,
        qrData: `https://demo.facturacion.local/verify/${genCode}`,
        rejectionReason: null,
        createdAt: now.toISOString(), updatedAt: now.toISOString(),
      };

      dteService.save(cn);
      dteService.incrementCounter('nota_credito');
      onCreated(cn);
    } catch (e) {
      setError('Error al crear nota de crédito');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Crear Nota de Crédito</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <div className="modal-body">
            <div className="alert alert-info py-2 small">
              DTE relacionado: <strong>{dte.controlNumber}</strong> | Total: <strong>{taxCalculationService.formatCurrency(maxAmount)}</strong>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Motivo *</label>
              <select className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
                {REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Monto a acreditar (USD) *</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input type="number" min="0.01" step="0.01" max={maxAmount / 100} className={`form-control ${error ? 'is-invalid' : ''}`}
                  value={amount} onChange={e => { setAmount(e.target.value); setError(''); }} placeholder="0.00" />
              </div>
              {error && <div className="text-danger small mt-1">{error}</div>}
              <div className="text-muted small mt-1">Máximo: {taxCalculationService.formatCurrency(maxAmount)}</div>
            </div>
            <div className="alert alert-warning py-2 small">
              <strong>SIMULACIÓN</strong> — La nota de crédito no tiene validez fiscal real. El DTE original no se modifica.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-warning" onClick={handleCreate} disabled={processing || !amount}>
              {processing && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />}
              Crear Nota de Crédito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
