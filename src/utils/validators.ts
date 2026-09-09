// ============================================================
// VALIDADORES REUTILIZABLES
// TODO: BACKEND — validar formatos fiscales con normativa MH oficial
// ============================================================
import { z } from 'zod';

// NIT: formato XXXX-XXXXXX-XXX-X (El Salvador)
export const nitRegex = /^\d{4}-\d{6}-\d{3}-\d$/;
export const nrcRegex = /^\d{1,7}-\d$/;
export const duiRegex = /^\d{8}-\d$/;
export const phoneRegex = /^[2-9]\d{3}-\d{4}$/;
export const emailSchema = z.string().email('Correo inválido');

export const nitSchema = z.string().refine(
  v => v === '' || nitRegex.test(v),
  { message: 'NIT inválido (formato: XXXX-XXXXXX-XXX-X)' }
);
export const nrcSchema = z.string().refine(
  v => v === '' || nrcRegex.test(v),
  { message: 'NRC inválido (formato: XXXXXXX-X)' }
);
export const duiSchema = z.string().refine(
  v => v === '' || duiRegex.test(v),
  { message: 'DUI inválido (formato: XXXXXXXX-X)' }
);

export const priceSchema = z
  .string()
  .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: 'Precio inválido' });

export const positiveIntSchema = z
  .number()
  .int('Debe ser entero')
  .min(0, 'No puede ser negativo');

export const discountPercentSchema = z
  .number()
  .min(0, 'Mínimo 0')
  .max(100, 'Máximo 100%');

// Format helpers
export function formatNIT(v: string): string {
  const d = v.replace(/\D/g, '');
  if (d.length >= 14) return `${d.slice(0,4)}-${d.slice(4,10)}-${d.slice(10,13)}-${d.slice(13,14)}`;
  return v;
}
export function formatDUI(v: string): string {
  const d = v.replace(/\D/g, '');
  if (d.length >= 9) return `${d.slice(0,8)}-${d.slice(8,9)}`;
  return v;
}
export function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '');
  if (d.length >= 8) return `${d.slice(0,4)}-${d.slice(4,8)}`;
  return v;
}
