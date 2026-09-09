import React from 'react';

const DTE_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  borrador:              { label: 'Borrador',              cls: 'secondary' },
  generado:              { label: 'Generado',              cls: 'info' },
  pendiente_transmision: { label: 'Pend. transmisión',     cls: 'warning text-dark' },
  transmitido:           { label: 'Transmitido',           cls: 'success' },
  contingencia:          { label: 'Contingencia',          cls: 'warning text-dark' },
  rechazado:             { label: 'Rechazado',             cls: 'danger' },
  anulado:               { label: 'Anulado',               cls: 'dark' },
  pendiente:             { label: 'Pendiente',             cls: 'warning text-dark' },
  parcial:               { label: 'Pago parcial',          cls: 'info' },
  pagado:                { label: 'Pagado',                cls: 'success' },
  vencido:               { label: 'Vencido',               cls: 'danger' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = DTE_STATUS_CONFIG[status] ?? { label: status, cls: 'secondary' };
  return <span className={`badge bg-${cfg.cls}`}>{cfg.label}</span>;
}
