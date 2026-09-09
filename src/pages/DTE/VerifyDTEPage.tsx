import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import dteService from '../../services/dte/dteService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import StatusBadge from '../../components/common/StatusBadge';

const TYPE_LABELS: Record<string, string> = { factura: 'Factura', ccf: 'CCF', nota_credito: 'Nota de Crédito' };

export default function VerifyDTEPage() {
  const { code } = useParams<{ code: string }>();
  const all = dteService.getAll();
  const dte = all.find(d => d.generationCode === code);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-light">
      <div className="card shadow border-0" style={{ maxWidth: 550, width: '100%' }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Verificación de Documento Tributario</h5>
          <p className="mb-0 small opacity-75">DEMO — No es verificación real del Ministerio de Hacienda</p>
        </div>
        <div className="card-body">
          <div className="alert alert-warning d-flex align-items-center gap-2 py-2">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span className="small"><strong>VERIFICACIÓN DEMO</strong> — Este sistema es un prototipo. No consulta los sistemas reales del Ministerio de Hacienda de El Salvador. Los documentos aquí mostrados son SIMULACIONES sin validez fiscal.</span>
          </div>

          {!dte ? (
            <div className="text-center py-4">
              <AlertTriangle size={40} className="text-danger mb-2" />
              <h5>Documento no encontrado</h5>
              <p className="text-muted small">Código: <code>{code}</code></p>
            </div>
          ) : (
            <table className="table table-sm">
              <tbody>
                <tr><td className="text-muted fw-semibold">Tipo</td><td>{TYPE_LABELS[dte.type] ?? dte.type}</td></tr>
                <tr><td className="text-muted fw-semibold">N° Control</td><td className="font-monospace">{dte.controlNumber}</td></tr>
                <tr><td className="text-muted fw-semibold">Código Generación</td><td className="font-monospace small text-break">{dte.generationCode}</td></tr>
                <tr><td className="text-muted fw-semibold">Fecha</td><td>{dte.emissionDate} {dte.emissionTime}</td></tr>
                <tr><td className="text-muted fw-semibold">Emisor</td><td>{dte.emitter.name}</td></tr>
                <tr><td className="text-muted fw-semibold">NIT Emisor</td><td className="font-monospace">{dte.emitter.nit}</td></tr>
                <tr><td className="text-muted fw-semibold">Receptor</td><td>{dte.receiver.name}</td></tr>
                <tr><td className="text-muted fw-semibold">Total</td><td className="fw-bold">{taxCalculationService.formatCurrency(dte.summary.total)}</td></tr>
                <tr><td className="text-muted fw-semibold">Estado</td><td><StatusBadge status={dte.status} /></td></tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="card-footer text-muted small text-center">
          Sistema de Ventas y Facturación — Grupo Epsilon · PROTOTIPO
        </div>
      </div>
    </div>
  );
}
