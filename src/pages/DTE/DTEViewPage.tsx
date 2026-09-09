import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, AlertTriangle, Send, PlusCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { useToast } from '../../contexts/ToastContext';
import dteService from '../../services/dte/dteService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import StatusBadge from '../../components/common/StatusBadge';
import type { DTE } from '../../types';
import CreditNoteModal from './CreditNoteModal';

const TYPE_LABELS: Record<string, string> = { factura: 'FACTURA', ccf: 'COMPROBANTE DE CRÉDITO FISCAL', nota_credito: 'NOTA DE CRÉDITO', nota_debito: 'NOTA DE DÉBITO' };

export default function DTEViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dte, setDte] = useState<DTE | null>(() => id ? dteService.getById(id) : null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showCNModal, setShowCNModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dte) return;
    QRCode.toDataURL(dte.qrData, { width: 120, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [dte]);

  if (!dte) return (
    <div className="p-4 text-center">
      <AlertTriangle size={48} className="text-danger mb-3" />
      <h4>Documento no encontrado</h4>
      <button className="btn btn-primary mt-2" onClick={() => navigate('/dte')}>Volver a DTE</button>
    </div>
  );

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const W = 210; const margin = 15;

    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, W, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('GRUPO EPSILON, S.A. DE C.V.', margin, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`NIT: ${dte.emitter.nit} | NRC: ${dte.emitter.nrc}`, margin, 19);
    doc.text(dte.emitter.address, margin, 25);
    doc.text(`Tel: ${dte.emitter.phone} | ${dte.emitter.email}`, margin, 31);

    // Document type
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(TYPE_LABELS[dte.type] ?? dte.type, W / 2, 48, { align: 'center' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('⚠ SIMULACIÓN — No tiene validez fiscal real. Pendiente de integración con Ministerio de Hacienda.', W / 2, 54, { align: 'center' });

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    let y = 62;
    const col2 = 110;
    doc.setFont('helvetica', 'bold'); doc.text('N° Control:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(dte.controlNumber, margin + 28, y);
    doc.setFont('helvetica', 'bold'); doc.text('Código generación:', col2, y); doc.setFont('helvetica', 'normal'); doc.text(dte.generationCode.slice(0, 20) + '...', col2 + 38, y);
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.text('Fecha:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(dte.emissionDate, margin + 15, y);
    doc.setFont('helvetica', 'bold'); doc.text('Hora:', col2, y); doc.setFont('helvetica', 'normal'); doc.text(dte.emissionTime, col2 + 12, y);
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.text('Modo:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(dte.emissionMode, margin + 14, y);
    doc.setFont('helvetica', 'bold'); doc.text('Estado:', col2, y); doc.setFont('helvetica', 'normal'); doc.text(dte.status.toUpperCase(), col2 + 15, y);

    // Receptor
    y += 10;
    doc.setFillColor(240, 240, 240); doc.rect(margin, y - 4, W - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('DATOS DEL RECEPTOR', margin + 2, y);
    y += 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(`Nombre: ${dte.receiver.name}`, margin, y); y += 5;
    doc.text(`NIT: ${dte.receiver.nit}  NRC: ${dte.receiver.nrc || 'N/A'}  DUI: ${dte.receiver.dui || 'N/A'}`, margin, y); y += 5;
    doc.text(`Dirección: ${dte.receiver.address}`, margin, y);

    // Items table header
    y += 10;
    doc.setFillColor(13, 110, 253); doc.rect(margin, y - 4, W - margin * 2, 6, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    const cols = [margin, 65, 95, 115, 135, 155, 175];
    doc.text('Descripción', cols[0], y);
    doc.text('Precio', cols[1], y);
    doc.text('Qty', cols[2], y);
    doc.text('Desc.', cols[3], y);
    doc.text('Base imp.', cols[4], y);
    doc.text('IVA', cols[5], y);
    doc.text('Total', cols[6], y);
    y += 5; doc.setTextColor(0);

    dte.items.forEach((item, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248); doc.rect(margin, y - 4, W - margin * 2, 5, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.text(item.productName.slice(0, 30), cols[0], y);
      doc.text(`$${(item.unitPrice/100).toFixed(2)}`, cols[1], y);
      doc.text(String(item.quantity), cols[2], y);
      doc.text(`$${(item.discountTotal/100).toFixed(2)}`, cols[3], y);
      doc.text(`$${(item.taxableBase/100).toFixed(2)}`, cols[4], y);
      doc.text(`$${(item.iva/100).toFixed(2)}`, cols[5], y);
      doc.text(`$${(item.total/100).toFixed(2)}`, cols[6], y);
      y += 5;
    });

    // Totals
    y += 4;
    const totX = 135;
    const fmtC = (c: number) => `$${(c/100).toFixed(2)}`;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Subtotal:', totX, y); doc.text(fmtC(dte.summary.subtotal), 185, y, { align: 'right' }); y += 5;
    if (dte.summary.totalDiscount > 0) { doc.text('Descuentos:', totX, y); doc.text(`-${fmtC(dte.summary.totalDiscount)}`, 185, y, { align: 'right' }); y += 5; }
    doc.text('Base imponible:', totX, y); doc.text(fmtC(dte.summary.taxableBase), 185, y, { align: 'right' }); y += 5;
    doc.text('IVA (13%):', totX, y); doc.text(fmtC(dte.summary.iva), 185, y, { align: 'right' }); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('TOTAL:', totX, y); doc.text(fmtC(dte.summary.total), 185, y, { align: 'right' });

    // Signature
    y += 10;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(100);
    doc.text(`Firma digital: ${dte.signatureSimulated ?? 'N/A'} — SIMULACIÓN`, margin, y);
    y += 4;
    doc.text('Este documento es una SIMULACIÓN. No constituye un DTE válido ante el Ministerio de Hacienda de El Salvador.', margin, y);

    // QR
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', W - margin - 30, 60, 30, 30);
    }

    doc.save(`DTE-${dte.controlNumber}.pdf`);
    toast('PDF generado correctamente', 'success');
  };

  const handlePrint = () => {
    window.print();
    toast('Enviando a impresora...', 'info');
  };

  const handleCNCreated = (newDte: DTE) => {
    setShowCNModal(false);
    toast(`Nota de crédito ${newDte.controlNumber} creada. SIMULACIÓN`, 'success');
    navigate(`/dte/${newDte.id}`);
  };

  return (
    <div className="p-4">
      {/* Actions bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2 no-print">
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => navigate('/dte')}>
          <ArrowLeft size={14} /> Volver
        </button>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={handleDownloadPDF}><Download size={14}/> PDF</button>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handlePrint}><Printer size={14}/> Imprimir</button>
          {dte.status !== 'anulado' && dte.type !== 'nota_credito' && (
            <button className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1" onClick={() => setShowCNModal(true)}><PlusCircle size={14}/> Nota de Crédito</button>
          )}
        </div>
      </div>

      {/* DTE Document */}
      <div ref={printRef} className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="card-header text-white py-3" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="fw-bold mb-0">{dte.emitter.name}</h5>
              <div className="small opacity-75">NIT: {dte.emitter.nit} | NRC: {dte.emitter.nrc}</div>
              <div className="small opacity-75">{dte.emitter.address}</div>
              <div className="small opacity-75">Tel: {dte.emitter.phone} | {dte.emitter.email}</div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="fs-4 fw-bold">{TYPE_LABELS[dte.type] ?? dte.type}</div>
              <div className="small opacity-75">{dte.emitter.economicActivity}</div>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Simulation warning */}
          <div className="alert alert-warning py-2 mb-3 d-flex align-items-center gap-2">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span className="small"><strong>SIMULACIÓN DE DTE</strong> — No tiene validez fiscal real. Pendiente de integración con Ministerio de Hacienda de El Salvador.</span>
          </div>

          {/* Document metadata */}
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <div className="row g-1 small">
                <div className="col-5 text-muted fw-semibold">N° Control:</div>
                <div className="col-7 font-monospace fw-bold">{dte.controlNumber}</div>
                <div className="col-5 text-muted fw-semibold">Cód. Generación:</div>
                <div className="col-7 font-monospace small text-break">{dte.generationCode}</div>
                <div className="col-5 text-muted fw-semibold">Fecha:</div>
                <div className="col-7">{dte.emissionDate} {dte.emissionTime}</div>
                <div className="col-5 text-muted fw-semibold">Modo:</div>
                <div className="col-7">
                  <span className={`badge ${dte.emissionMode === 'CONTINGENCIA' ? 'bg-warning text-dark' : 'bg-success'}`}>{dte.emissionMode}</span>
                </div>
                <div className="col-5 text-muted fw-semibold">Estado:</div>
                <div className="col-7"><StatusBadge status={dte.status} /></div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="small text-muted fw-semibold mb-1">Firma digital:</div>
              <div className="small font-monospace text-break">{dte.signatureSimulated ?? 'Sin firma'}</div>
              <div className="badge bg-warning text-dark mt-1">SIMULACIÓN</div>
            </div>
            <div className="col-md-3 text-center">
              {qrDataUrl ? (
                <>
                  <img src={qrDataUrl} alt="Código QR del DTE" className="border p-1" style={{ width: 100 }} />
                  <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                    Verificación DEMO — no es URL real del MH
                  </div>
                </>
              ) : (
                <div className="bg-light border d-flex align-items-center justify-content-center" style={{ width: 100, height: 100, margin: '0 auto' }}>
                  <span className="text-muted small">QR</span>
                </div>
              )}
            </div>
          </div>

          {/* Receptor */}
          <div className="card bg-light border-0 mb-3">
            <div className="card-body py-2">
              <h6 className="fw-semibold mb-2 small text-muted text-uppercase">Receptor</h6>
              <div className="row g-1 small">
                <div className="col-md-6"><span className="text-muted">Nombre:</span> <strong>{dte.receiver.name}</strong></div>
                <div className="col-md-3"><span className="text-muted">NIT:</span> <span className="font-monospace">{dte.receiver.nit}</span></div>
                <div className="col-md-3"><span className="text-muted">NRC:</span> <span className="font-monospace">{dte.receiver.nrc || '—'}</span></div>
                <div className="col-md-6"><span className="text-muted">Dirección:</span> {dte.receiver.address}</div>
                <div className="col-md-3"><span className="text-muted">DUI:</span> {dte.receiver.dui || '—'}</div>
                <div className="col-md-3"><span className="text-muted">IVA:</span> {dte.receiver.ivaExempt ? 'Exento' : 'Gravado'}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="table-responsive mb-3">
            <table className="table table-bordered table-sm align-middle">
              <thead className="table-primary">
                <tr>
                  <th>#</th><th>Descripción</th><th className="text-end">P.U.</th>
                  <th className="text-center">Qty</th><th className="text-end">Descuento</th>
                  <th className="text-end">Base imp.</th><th className="text-end">IVA</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {dte.items.map((item, i) => (
                  <tr key={i}>
                    <td className="text-muted small">{i + 1}</td>
                    <td>
                      <div className="fw-semibold small">{item.productName}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{item.productCode}</div>
                    </td>
                    <td className="text-end small">{taxCalculationService.formatCurrency(item.unitPrice)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end small">{taxCalculationService.formatCurrency(item.discountTotal)}</td>
                    <td className="text-end small">{taxCalculationService.formatCurrency(item.taxableBase)}</td>
                    <td className="text-end small">{taxCalculationService.formatCurrency(item.iva)}</td>
                    <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="row justify-content-end">
            <div className="col-md-4">
              <table className="table table-sm">
                <tbody>
                  <tr><td className="text-muted">Subtotal</td><td className="text-end">{taxCalculationService.formatCurrency(dte.summary.subtotal)}</td></tr>
                  {dte.summary.totalDiscount > 0 && <tr><td className="text-danger">Descuentos</td><td className="text-end text-danger">-{taxCalculationService.formatCurrency(dte.summary.totalDiscount)}</td></tr>}
                  <tr><td className="text-muted">Base imponible</td><td className="text-end">{taxCalculationService.formatCurrency(dte.summary.taxableBase)}</td></tr>
                  <tr><td className="text-muted">IVA (13%)</td><td className="text-end">{taxCalculationService.formatCurrency(dte.summary.iva)}</td></tr>
                  <tr className="fw-bold table-primary">
                    <td className="fs-5">TOTAL</td>
                    <td className="text-end fs-5">{taxCalculationService.formatCurrency(dte.summary.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
            <FileText size={12} className="me-1" />
            Documento generado como SIMULACIÓN del sistema de facturación electrónica Grupo Epsilon.
            Los DTE legalmente válidos requieren integración con el Ministerio de Hacienda de El Salvador.
          </div>
        </div>
      </div>

      {showCNModal && (
        <CreditNoteModal dte={dte} onClose={() => setShowCNModal(false)} onCreated={handleCNCreated} />
      )}
    </div>
  );
}
