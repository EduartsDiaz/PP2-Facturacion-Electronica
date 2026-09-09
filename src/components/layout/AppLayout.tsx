import React, { useState, useCallback, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import WelcomeOverlay from '../common/WelcomeOverlay';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout() {
  const { session } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shownRef = useRef<string | null>(null);

  // Show welcome once per session id (survives re-renders, not page reloads)
  const [showWelcome, setShowWelcome] = useState(() => !!session);
  if (session && shownRef.current !== session.userId) {
    shownRef.current = session.userId;
  }

  const handleWelcomeDone = useCallback(() => setShowWelcome(false), []);

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {showWelcome && session && (
        <WelcomeOverlay name={session.name} role={session.role} onDone={handleWelcomeDone} />
      )}

      {mobileOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </aside>

      <div className="app-main">
        <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
