import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4">
      <ShieldOff size={64} className="text-danger mb-3" />
      <h1 className="h3 fw-bold">Acceso no autorizado</h1>
      <p className="text-muted mb-4">No tienes permisos para acceder a esta sección.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Ir al dashboard</button>
    </div>
  );
}
