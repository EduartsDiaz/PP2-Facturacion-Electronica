import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, Wifi, WifiOff, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import storageService, { KEYS } from '../../services/storage/storageService';
import type { CompanySettings } from '../../types';
import { SEED_SETTINGS } from '../../mock/seeds';
import ConfirmModal from '../../components/common/ConfirmModal';

const SV_DEPARTMENTS = ['Ahuachapán','Cabañas','Chalatenango','Cuscatlán','La Libertad','La Paz','La Unión','Morazán','San Miguel','San Salvador','San Vicente','Santa Ana','Sonsonate','Usulután'];

export default function SettingsPage() {
  const { toast } = useToast();
  const { isOnline, processQueue, refreshQueue } = useConnectivity();
  const [settings, setSettings] = useState(() => storageService.get<CompanySettings>(KEYS.SETTINGS) ?? SEED_SETTINGS);
  const [confirmClear, setConfirmClear] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm<CompanySettings>({ defaultValues: settings });
  const simOffline = watch('simulateOffline');

  const onSubmit = (data: CompanySettings) => {
    storageService.set(KEYS.SETTINGS, { ...settings, ...data });
    setSettings({ ...settings, ...data });
    toast('Configuración guardada correctamente', 'success');
  };

  const handleSync = async () => {
    if (!isOnline) { toast('Sin conexión real.', 'warning'); return; }
    const n = await processQueue(); refreshQueue();
    toast(`${n} documento(s) sincronizados. SIMULACIÓN`, 'success');
  };

  const handleClearData = () => {
    storageService.clear();
    window.location.reload();
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div><h2 className="h4 fw-bold mb-0">Configuración</h2><p className="text-muted small mb-0">Ajustes del sistema y empresa</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          {/* Company info */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white fw-semibold">Información de la empresa</div>
              <div className="card-body row g-3">
                <div className="col-md-6"><label className="form-label fw-semibold">Razón social *</label><input className="form-control" {...register('name')} /></div>
                <div className="col-md-6"><label className="form-label fw-semibold">Nombre comercial</label><input className="form-control" {...register('tradeName')} /></div>
                <div className="col-md-4"><label className="form-label fw-semibold">NIT <span className="text-muted fw-normal small">(fiscal)</span></label><input className="form-control font-monospace" {...register('nit')} /></div>
                <div className="col-md-4"><label className="form-label fw-semibold">NRC <span className="text-muted fw-normal small">(fiscal)</span></label><input className="form-control font-monospace" {...register('nrc')} /></div>
                <div className="col-md-4"><label className="form-label fw-semibold">Actividad económica</label><input className="form-control" {...register('economicActivity')} /></div>
                <div className="col-12"><label className="form-label fw-semibold">Dirección</label><input className="form-control" {...register('address')} /></div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Departamento</label>
                  <select className="form-select" {...register('department')}>
                    {SV_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-4"><label className="form-label fw-semibold">Municipio</label><input className="form-control" {...register('municipality')} /></div>
                <div className="col-md-4"><label className="form-label fw-semibold">Teléfono</label><input className="form-control" {...register('phone')} /></div>
                <div className="col-md-6"><label className="form-label fw-semibold">Correo</label><input type="email" className="form-control" {...register('email')} /></div>
                <div className="col-md-6"><label className="form-label fw-semibold">Sitio web</label><input className="form-control" {...register('website')} /></div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white fw-semibold">Numeración de documentos</div>
              <div className="card-body row g-3">
                <div className="col-md-4"><label className="form-label fw-semibold">Prefijo Facturas</label><input className="form-control" {...register('invoicePrefix')} /></div>
                <div className="col-md-4"><label className="form-label fw-semibold">Prefijo CCF</label><input className="form-control" {...register('ccfPrefix')} /></div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tasa IVA</label>
                  <div className="input-group"><input type="number" step="0.01" className="form-control" {...register('ivaRate', { valueAsNumber: true })} readOnly /><span className="input-group-text">%</span></div>
                  <div className="form-text">TODO: Modificar solo con actualización normativa oficial del MH</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — demo/offline */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white fw-semibold d-flex align-items-center gap-2">
                {isOnline ? <Wifi size={16} className="text-success" /> : <WifiOff size={16} className="text-danger" />}
                Modo de conexión
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold">Estado actual:</span>
                  <span className={`badge ${isOnline ? 'bg-success' : 'bg-danger'}`}>{isOnline ? 'En línea' : 'Sin conexión'}</span>
                </div>
                <hr />
                <div className="form-check form-switch mb-3">
                  <input type="checkbox" className="form-check-input" id="simOffline" role="switch" {...register('simulateOffline')} />
                  <label htmlFor="simOffline" className="form-check-label fw-semibold">
                    Simular desconexión (demo offline)
                  </label>
                  <div className="form-text">Al activar, el sistema funciona en modo contingencia. Útil para demostrar el modo offline.</div>
                </div>
                {simOffline && (
                  <div className="alert alert-warning py-2 small">
                    <WifiOff size={13} className="me-1" />
                    Modo contingencia activo. Los nuevos DTE se agregarán a la cola de sincronización. SIMULACIÓN
                  </div>
                )}
                <button type="button" className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleSync}>
                  <RefreshCw size={14} /> Procesar cola offline
                </button>
                <div className="alert alert-info mt-2 py-2 small">
                  TODO: BACKEND — la sincronización real requiere conectividad con los servicios del MH y certificados digitales vigentes.
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm border-danger">
              <div className="card-header bg-white fw-semibold text-danger">Zona peligrosa</div>
              <div className="card-body">
                <p className="small text-muted">Elimina todos los datos del prototipo y reinicia con datos demo.</p>
                <button type="button" className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => setConfirmClear(true)}>
                  <Trash2 size={14} /> Reiniciar datos demo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary px-4">Guardar configuración</button>
        </div>
      </form>

      <ConfirmModal
        show={confirmClear}
        title="Reiniciar datos de demostración"
        message="Se eliminarán TODOS los datos (ventas, clientes, DTE, etc.) y se restaurarán los datos de demo. ¿Confirmar?"
        confirmLabel="Reiniciar todo"
        variant="danger"
        onConfirm={handleClearData}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
