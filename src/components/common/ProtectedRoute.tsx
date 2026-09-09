import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../services/auth/authService';

interface Props { module?: string; children: React.ReactNode; }

export default function ProtectedRoute({ module, children }: Props) {
  const { session, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (module && session && !canAccess(session.role, module)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
