// ============================================================
// TIPOS CENTRALES — Sistema de Ventas y Facturación Epsilon
// ============================================================

// --- Roles ---
export type Role = 'admin' | 'cajero' | 'supervisor' | 'contador';

// --- Users ---
export interface User {
  id: string;
  username: string;
  passwordHash: string; // TODO: BACKEND — reemplazar con hash bcrypt real
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Auth Session ---
export interface AuthSession {
  userId: string;
  username: string;
  name: string;
  role: Role;
  loginAt: string;
}

// --- Customers ---
export type PersonType = 'natural' | 'juridica';
export type TaxpayerType = 'grande' | 'mediano' | 'pequeño' | 'excluido';

export interface Customer {
  id: string;
  personType: PersonType;
  name: string;
  nit: string;
  nrc: string;
  dui: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  municipality: string;
  taxpayerType: TaxpayerType;
  ivaExempt: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Products ---
export type UnitOfMeasure = 'unidad' | 'caja' | 'kg' | 'litro' | 'metro' | 'par' | 'paquete' | 'docena' | 'servicio';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;        // en centavos
  applyIva: boolean;
  stock: number;
  minStock: number;
  unit: UnitOfMeasure;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Inventory ---
export type MovementType = 'entrada' | 'salida' | 'ajuste';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// --- Sales ---
export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;    // en centavos
  discount: number;     // en centavos
  subtotal: number;     // en centavos (unitPrice * qty)
  discountTotal: number;// en centavos
  taxableBase: number;  // en centavos
  iva: number;          // en centavos
  total: number;        // en centavos
  applyIva: boolean;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;       // en centavos
  totalDiscount: number;  // en centavos
  taxableBase: number;    // en centavos
  iva: number;            // en centavos
  total: number;          // en centavos
  paymentMethod: PaymentMethod;
  dteId: string | null;
  userId: string;
  userName: string;
  createdAt: string;
  notes: string;
}

// --- DTE ---
export type DteType = 'factura' | 'ccf' | 'nota_credito' | 'nota_debito';
export type DteStatus = 'borrador' | 'generado' | 'pendiente_transmision' | 'transmitido' | 'contingencia' | 'rechazado' | 'anulado';
export type EmissionMode = 'NORMAL' | 'CONTINGENCIA';

export interface DteEmitter {
  name: string;
  nit: string;
  nrc: string;
  address: string;
  phone: string;
  email: string;
  economicActivity: string;
}

export interface DteReceiver {
  customerId: string;
  name: string;
  nit: string;
  nrc: string;
  dui: string;
  address: string;
  email: string;
  taxpayerType: TaxpayerType;
  ivaExempt: boolean;
}

export interface DteSummary {
  subtotal: number;
  totalDiscount: number;
  taxableBase: number;
  iva: number;
  total: number;
}

export interface DTE {
  id: string;
  type: DteType;
  controlNumber: string;
  generationCode: string;
  emissionDate: string;
  emissionTime: string;
  emitter: DteEmitter;
  receiver: DteReceiver;
  items: SaleItem[];
  summary: DteSummary;
  status: DteStatus;
  emissionMode: EmissionMode;
  signed: boolean;
  signatureSimulated: string | null;
  transmitted: boolean;
  transmittedAt: string | null;
  saleId: string;
  relatedDteId: string | null;
  creditNoteReason: string | null;
  qrData: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Accounts Receivable ---
export type ARStatus = 'pendiente' | 'parcial' | 'pagado' | 'vencido';

export interface AccountReceivable {
  id: string;
  customerId: string;
  customerName: string;
  dteId: string;
  dteControlNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;     // en centavos
  paid: number;       // en centavos
  balance: number;    // en centavos
  status: ARStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Audit ---
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
}

// --- Settings ---
export interface CompanySettings {
  name: string;
  tradeName: string;
  nit: string;
  nrc: string;
  address: string;
  department: string;
  municipality: string;
  phone: string;
  email: string;
  website: string;
  economicActivity: string;
  ivaRate: number;        // 0.13
  invoicePrefix: string;
  ccfPrefix: string;
  nextInvoiceNumber: number;
  nextCCFNumber: number;
  nextCreditNoteNumber: number;
  contingencyEnabled: boolean;
  simulateOffline: boolean;
  logoDataUrl: string;
}

// --- Offline Queue ---
export interface OfflineQueueItem {
  id: string;
  dteId: string;
  addedAt: string;
  attempts: number;
}

// --- Tax Calculation ---
export interface TaxLineResult {
  subtotal: number;       // qty * unitPrice  (centavos)
  discountAmount: number; // centavos
  taxableBase: number;    // centavos
  iva: number;            // centavos
  total: number;          // centavos
}

export interface TaxTotals {
  subtotal: number;
  totalDiscount: number;
  taxableBase: number;
  iva: number;
  total: number;
}
