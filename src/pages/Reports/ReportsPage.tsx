import React, { useState, useMemo } from 'react';
import { Download, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import salesService from '../../services/sales/salesService';
import dteService from '../../services/dte/dteService';
import productService from '../../services/products/productService';
import taxCalculationService from '../../services/tax/taxCalculationService';

function downloadCSV(data: string[][], filename: string) {
  const csv = data.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

type ReportTab = 'sales' | 'dte' | 'inventory';

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('sales');
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));

  const allSales = useMemo(() => salesService.getAll(), []);
  const allDtes = useMemo(() => dteService.getAll(), []);
  const allProducts = useMemo(() => productService.getAll(), []);

  const filteredSales = useMemo(() => allSales.filter(s => s.createdAt >= from && s.createdAt <= to + 'T23:59:59'), [allSales, from, to]);
  const filteredDtes = useMemo(() => allDtes.filter(d => d.createdAt >= from && d.createdAt <= to + 'T23:59:59'), [allDtes, from, to]);

  // Sales summary
  const salesSummary = useMemo(() => ({
    count: filteredSales.length,
    subtotal: filteredSales.reduce((s, x) => s + x.subtotal, 0),
    discount: filteredSales.reduce((s, x) => s + x.totalDiscount, 0),
    iva: filteredSales.reduce((s, x) => s + x.iva, 0),
    total: filteredSales.reduce((s, x) => s + x.total, 0),
  }), [filteredSales]);

  // DTE summary
  const dteSummary = useMemo(() => ({
    transmitted: filteredDtes.filter(d => d.status === 'transmitido').length,
    pending: filteredDtes.filter(d => d.status === 'pendiente_transmision').length,
    contingency: filteredDtes.filter(d => d.status === 'contingencia').length,
    rejected: filteredDtes.filter(d => d.status === 'rechazado').length,
    cancelled: filteredDtes.filter(d => d.status === 'anulado').length,
    totalAmount: filteredDtes.filter(d => d.status === 'transmitido').reduce((s, d) => s + d.summary.total, 0),
  }), [filteredDtes]);

  // Chart: sales by day
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      const day = s.createdAt.slice(0,10);
      map[day] = (map[day] ?? 0) + s.total;
    });
    return Object.entries(map).sort().map(([day, total]) => ({ day, total: total / 100 }));
  }, [filteredSales]);

  // Inventory value
  const inventoryValue = useMemo(() => allProducts.filter(p => p.active).reduce((s, p) => s + p.price * p.stock, 0), [allProducts]);

  const exportSales = () => {
    const headers = ['Fecha','Cliente','Subtotal','Descuento','IVA','Total','Método pago'];
    const rows = filteredSales.map(s => [
      s.createdAt.slice(0,10), s.customerName,
      (s.subtotal/100).toFixed(2), (s.totalDiscount/100).toFixed(2),
      (s.iva/100).toFixed(2), (s.total/100).toFixed(2), s.paymentMethod,
    ]);
    downloadCSV([headers, ...rows], `reporte-ventas-${from}-${to}.csv`);
  };

  const exportDtes = () => {
    const headers = ['Fecha','Tipo','N° Control','Receptor','Total','Estado','Modo'];
    const rows = filteredDtes.map(d => [
      d.emissionDate, d.type, d.controlNumber, d.receiver.name,
      (d.summary.total/100).toFixed(2), d.status, d.emissionMode,
    ]);
    downloadCSV([headers, ...rows], `reporte-dte-${from}-${to}.csv`);
  };

  const exportInventory = () => {
    const headers = ['Código','Nombre','Categoría','Stock','Stock mínimo','Precio','Valor total'];
    const rows = allProducts.filter(p => p.active).map(p => [
      p.code, p.name, p.category, String(p.stock), String(p.minStock),
      (p.price/100).toFixed(2), ((p.price * p.stock)/100).toFixed(2),
    ]);
    downloadCSV([headers, ...rows], `reporte-inventario.csv`);
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="h4 fw-bold mb-0">Reportes</h2>
          <p className="text-muted small mb-0">Exporta datos a CSV para análisis externo</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {([['sales', 'Ventas'], ['dte', 'DTE'], ['inventory', 'Inventario']] as [ReportTab, string][]).map(([t, l]) => (
          <li key={t} className="nav-item" role="presentation">
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} role="tab">{l}</button>
          </li>
        ))}
      </ul>

      {(tab === 'sales' || tab === 'dte') && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">Desde</label>
                <input type="date" className="form-control form-control-sm" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">Hasta</label>
                <input type="date" className="form-control form-control-sm" value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <>
          {/* Summary cards */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Documentos', value: String(salesSummary.count) },
              { label: 'Subtotal', value: taxCalculationService.formatCurrency(salesSummary.subtotal) },
              { label: 'Descuentos', value: taxCalculationService.formatCurrency(salesSummary.discount) },
              { label: 'IVA', value: taxCalculationService.formatCurrency(salesSummary.iva) },
              { label: 'Total', value: taxCalculationService.formatCurrency(salesSummary.total) },
            ].map(c => (
              <div key={c.label} className="col-6 col-md">
                <div className="card border-0 shadow-sm text-center py-3">
                  <div className="text-muted small">{c.label}</div>
                  <div className="fw-bold fs-5">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Ventas por día</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Total']} />
                    <Bar dataKey="total" fill="#0d6efd" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Detalle de ventas ({filteredSales.length})</span>
              <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={exportSales}><Download size={14}/> CSV</button>
            </div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light"><tr><th>Fecha</th><th>Cliente</th><th className="text-end">Subtotal</th><th className="text-end">IVA</th><th className="text-end">Total</th><th>Pago</th></tr></thead>
                <tbody>
                  {filteredSales.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-3">Sin datos en el período</td></tr>}
                  {filteredSales.slice(0, 50).map(s => (
                    <tr key={s.id}>
                      <td className="small text-muted">{s.createdAt.slice(0,10)}</td>
                      <td className="small">{s.customerName}</td>
                      <td className="text-end small">{taxCalculationService.formatCurrency(s.subtotal)}</td>
                      <td className="text-end small">{taxCalculationService.formatCurrency(s.iva)}</td>
                      <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(s.total)}</td>
                      <td className="small">{s.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'dte' && (
        <>
          <div className="row g-3 mb-4">
            {[
              { label: 'Transmitidos', value: dteSummary.transmitted, cls: 'success' },
              { label: 'Pendientes', value: dteSummary.pending, cls: 'warning' },
              { label: 'Contingencia', value: dteSummary.contingency, cls: 'warning' },
              { label: 'Rechazados', value: dteSummary.rejected, cls: 'danger' },
              { label: 'Anulados', value: dteSummary.cancelled, cls: 'secondary' },
            ].map(c => (
              <div key={c.label} className="col-6 col-md">
                <div className={`card border-0 shadow-sm text-center py-3 border-start border-${c.cls} border-3`}>
                  <div className="text-muted small">{c.label}</div>
                  <div className="fw-bold fs-4">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Documentos ({filteredDtes.length})</span>
              <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={exportDtes}><Download size={14}/> CSV</button>
            </div>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light"><tr><th>Fecha</th><th>Tipo</th><th>N° Control</th><th>Receptor</th><th className="text-end">Total</th><th>Estado</th></tr></thead>
                <tbody>
                  {filteredDtes.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-3">Sin datos</td></tr>}
                  {filteredDtes.slice(0,50).map(d => (
                    <tr key={d.id}>
                      <td className="small text-muted">{d.emissionDate}</td>
                      <td><span className="badge bg-secondary">{d.type}</span></td>
                      <td className="font-monospace small">{d.controlNumber}</td>
                      <td className="small">{d.receiver.name}</td>
                      <td className="text-end">{taxCalculationService.formatCurrency(d.summary.total)}</td>
                      <td><span className="badge bg-secondary">{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'inventory' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex align-items-center justify-content-between">
            <div>
              <span className="fw-semibold">Inventario actual</span>
              <span className="ms-2 text-muted small">Valor total: <strong>{taxCalculationService.formatCurrency(inventoryValue)}</strong></span>
            </div>
            <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={exportInventory}><Download size={14}/> CSV</button>
          </div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead className="table-light"><tr><th>Código</th><th>Producto</th><th>Cat.</th><th className="text-center">Stock</th><th className="text-center">Mínimo</th><th className="text-end">Precio</th><th className="text-end">Valor</th><th>Estado</th></tr></thead>
              <tbody>
                {allProducts.filter(p => p.active).map(p => (
                  <tr key={p.id}>
                    <td className="font-monospace small">{p.code}</td>
                    <td className="small fw-semibold">{p.name}</td>
                    <td><span className="badge bg-secondary">{p.category}</span></td>
                    <td className="text-center">{p.stock}</td>
                    <td className="text-center text-muted">{p.minStock}</td>
                    <td className="text-end">{taxCalculationService.formatCurrency(p.price)}</td>
                    <td className="text-end fw-semibold">{taxCalculationService.formatCurrency(p.price * p.stock)}</td>
                    <td>
                      {p.stock === 0 ? <span className="badge bg-danger">Agotado</span>
                        : p.stock <= p.minStock ? <span className="badge bg-warning text-dark">Stock bajo</span>
                        : <span className="badge bg-success">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
