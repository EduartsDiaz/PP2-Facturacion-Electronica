import React from 'react';
import { Wifi, WifiOff, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConnectivity } from '../../contexts/ConnectivityContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador', cajero: 'Cajero',
  supervisor: 'Supervisor', contador: 'Contador',
};

export default function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { session } = useAuth();
  const { isOnline, queueCount } = useConnectivity();

  return (
    <header className="topbar d-flex align-items-center px-3 py-2 gap-3">
      {/* Mobile hamburger */}
      <button className="btn btn-link text-secondary d-lg-none p-0" onClick={onMenuToggle} aria-label="Abrir menú">
        <Menu size={22} />
      </button>

      {/* System name */}
      <div className="d-none d-md-block">
        <span className="fw-semibold text-primary">Sistema de Ventas y Facturación</span>
        <span className="text-muted small ms-2">— Grupo Epsilon</span>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Connectivity indicator */}
        <div className={`d-flex align-items-center gap-1 badge ${isOnline ? 'bg-success' : 'bg-danger'} text-white`}>
          {isOnline
            ? <><Wifi size={13} /> <span className="d-none d-sm-inline">Conectado</span></>
            : <><WifiOff size={13} /> <span className="d-none d-sm-inline">Sin conexión</span></>
          }
        </div>

        {/* Queue badge */}
        {queueCount > 0 && (
          <span className="badge bg-warning text-dark" title={`${queueCount} documento(s) en cola de sincronización`}>
            <Bell size={13} className="me-1" />
            {queueCount} pendiente{queueCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* User info */}
        {session && (
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-circle bg-primary text-white">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="d-none d-md-block text-end">
              <div className="fw-semibold small lh-1">{session.name}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>{ROLE_LABELS[session.role] ?? session.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
