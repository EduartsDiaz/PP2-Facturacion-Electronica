import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../services/auth/authService';
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package,
  Archive, CreditCard, BarChart2, UserCog, Settings, LogOut,
  Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import LogoutOverlay from '../common/LogoutOverlay';

interface NavItem {
  to: string; label: string; icon: React.ReactNode; module: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',               icon: <LayoutDashboard size={18} />, module: 'dashboard' },
  { to: '/sales',      label: 'Ventas',                   icon: <ShoppingCart size={18} />,    module: 'sales' },
  { to: '/dte',        label: 'Facturación electrónica',  icon: <FileText size={18} />,        module: 'dte' },
  { to: '/customers',  label: 'Clientes',                 icon: <Users size={18} />,           module: 'customers' },
  { to: '/products',   label: 'Productos',                icon: <Package size={18} />,         module: 'products' },
  { to: '/inventory',  label: 'Inventario',               icon: <Archive size={18} />,         module: 'inventory' },
  { to: '/ar',         label: 'Cuentas por cobrar',       icon: <CreditCard size={18} />,      module: 'ar' },
  { to: '/reports',    label: 'Reportes',                 icon: <BarChart2 size={18} />,       module: 'reports' },
  { to: '/users',      label: 'Usuarios',                 icon: <UserCog size={18} />,         module: 'users' },
  { to: '/settings',   label: 'Configuración',            icon: <Settings size={18} />,        module: 'settings' },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
  };

  const finishLogout = () => {
    logout();
    navigate('/login');
  };

  const visible = session ? NAV_ITEMS.filter(n => canAccess(session.role, n.module)) : [];

  return (
    <>
      {loggingOut && <LogoutOverlay onDone={finishLogout} />}
      <nav className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} d-flex flex-column`} aria-label="Navegación principal">
        {/* Header */}
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
          {!collapsed && (
            <div className="d-flex align-items-center gap-2">
              <Zap size={22} className="text-warning" />
              <span className="fw-bold text-white fs-6">Epsilon</span>
            </div>
          )}
          {collapsed && <Zap size={22} className="text-warning mx-auto" />}
          <button className="btn btn-link text-white p-0 ms-auto" onClick={onToggle} aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <ul className="nav flex-column flex-grow-1 px-2 mt-1" role="list">
          {visible.map(item => (
            <li key={item.to} className="nav-item" role="listitem">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `nav-link sidebar-link d-flex align-items-center gap-2 py-2 px-2 rounded mb-1 ${isActive ? 'active' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Footer / logout */}
        <div className="sidebar-footer p-2 border-top border-secondary">
          {!collapsed && session && (
            <div className="px-2 py-1 mb-1">
              <div className="text-white-50 small">{session.name}</div>
              <div className="text-warning small text-capitalize">{session.role}</div>
            </div>
          )}
          <button
            className="btn btn-link text-white-50 d-flex align-items-center gap-2 w-100 px-2 py-1 text-decoration-none"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </nav>
    </>
  );
}
