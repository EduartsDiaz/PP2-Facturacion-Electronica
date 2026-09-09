import React, { useMemo } from 'react';
import {
  ShoppingCart, FileText, AlertTriangle, Clock, TrendingUp,
  Package, CreditCard, Wifi, WifiOff, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { useToast } from '../../contexts/ToastContext';
import salesService from '../../services/sales/salesService';
import dteService from '../../services/dte/dteService';
import productService from '../../services/products/productService';
import arService from '../../services/ar/arService';
import taxCalculationService from '../../services/tax/taxCalculationService';
import connectivityService from '../../services/connectivity/connectivityService';

const COLORS = ['#0d6efd','#198754','#ffc107','#dc3545','#6c757d','#0dcaf0'];

function StatCard({ title, value, sub, icon, color }: { title: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-start gap-3">
        <div className={`p-2 rounded-3 bg-${color} bg-opacity-10 text-${color}`}>{icon}</div>
        <div className="flex-grow-1 min-w-0">
          <div className="text-muted small">{title}</div>
          <div className="fs-4 fw-bold">{value}</div>
          {sub && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isOnline, queueCount, processQueue } = useConnectivity();
  const { toast } = useToast();

  const data = useMemo(() => {
    const todaySales = salesService.getTodaySales();
    const monthSales = salesService.getMonthSales();
    const dtes = dteService.getAll();
    const products = productService.getAll();
    const ar = arService.getAll();

    const todayTotal = todaySales.reduce((s, sale) => s + sale.total, 0);
    const monthTotal = monthSales.reduce((s, sale) => s + sale.total, 0);
    const transmitidos = dtes.filter(d => d.status === 'transmitido').length;
    const pendientes = dtes.filter(d => d.status === 'pendiente_transmision').length;
    const contingencia = dtes.filter(d => d.status === 'contingencia').length;
    const rechazados = dtes.filter(d => d.status === 'rechazado').length;
    const lowStock = products.filter(p => p.stock <= p.minStock && p.active);
    const arPending = ar.filter(a => a.status !== 'pagado').reduce((s, a) => s + a.balance, 0);

    // Sales last 7 days
    const last7: { day: string; total: number }[] = [];
    const allSales = salesService.getAll();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const day = d.toISOString().slice(0, 10);
      const total = allSales.filter(s => s.createdAt.startsWith(day)).reduce((s, sale) => s + sale.total, 0);
      last7.push({ day: d.toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric' }), total: total / 100 });
    }

    // By type
    const typeCounts = [
      { name: 'Facturas', value: dtes.filter(d => d.type === 'factura').length },
      { name: 'CCF', value: dtes.filter(d => d.type === 'ccf').length },
      { name: 'Notas Crédito', value: dtes.filter(d => d.type === 'nota_credito').length },
    ].filter(t => t.value > 0);

    return { todayTotal, monthTotal, transmitidos, pendientes, contingencia, rechazados, lowStock, arPending, last7, typeCounts };
  }, []);

  const handleSync = async () => {
    if (!isOnline) { toast('Sin conexión. No es posible sincronizar.', 'warning'); return; }
    const count = await processQueue();
    toast(`Sincronización completada — ${count} documento(s) procesados. SIMULACIÓN`, 'success');
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-0">Dashboard</h2>
          <p className="text-muted small mb-0">Resumen general del sistema</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${isOnline ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-1`}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isOnline ? 'En línea' : 'Sin conexión — Modo contingencia'}
          </span>
          {queueCount > 0 && (
            <button className="btn btn-warning btn-sm d-flex align-items-center gap-1" onClick={handleSync}>
              <RefreshCw size={14} /> Sincronizar ({queueCount})
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard title="Ventas hoy" value={taxCalculationService.formatCurrency(data.todayTotal)} icon={<ShoppingCart size={22} />} color="primary" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Ventas del mes" value={taxCalculationService.formatCurrency(data.monthTotal)} icon={<TrendingUp size={22} />} color="success" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="DTE transmitidos" value={String(data.transmitidos)} sub={`${data.pendientes} pendientes`} icon={<FileText size={22} />} color="info" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Cuentas por cobrar" value={taxCalculationService.formatCurrency(data.arPending)} icon={<CreditCard size={22} />} color="warning" />
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard title="En contingencia" value={String(data.contingencia)} icon={<AlertTriangle size={22} />} color="warning" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="DTE rechazados" value={String(data.rechazados)} icon={<AlertTriangle size={22} />} color="danger" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Prod. stock bajo" value={String(data.lowStock.length)} icon={<Package size={22} />} color="danger" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Cola offline" value={String(queueCount)} icon={<Clock size={22} />} color="secondary" />
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Ventas — últimos 7 días</h6>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.last7}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Total']} />
                  <Bar dataKey="total" fill="#0d6efd" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Documentos por tipo</h6>
              {data.typeCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.typeCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {data.typeCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-4">Sin datos</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {data.lowStock.length > 0 && (
        <div className="card border-warning shadow-sm">
          <div className="card-header bg-warning bg-opacity-10 border-warning d-flex align-items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <span className="fw-semibold">Productos con stock bajo o agotado</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light"><tr><th>Código</th><th>Producto</th><th className="text-center">Stock</th><th className="text-center">Mínimo</th></tr></thead>
                <tbody>
                  {data.lowStock.map(p => (
                    <tr key={p.id}>
                      <td className="small font-monospace">{p.code}</td>
                      <td className="small">{p.name}</td>
                      <td className="text-center"><span className={`badge ${p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'}`}>{p.stock}</span></td>
                      <td className="text-center text-muted small">{p.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
