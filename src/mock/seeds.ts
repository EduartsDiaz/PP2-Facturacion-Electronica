// ============================================================
// DATOS DE DEMOSTRACIÓN — Ficticios, no usar en producción
// ============================================================
import type {
  User, Customer, Product, Sale, DTE, AccountReceivable,
  AuditLog, InventoryMovement, CompanySettings, DteStatus, EmissionMode,
} from '../types';

// Simple hash simulado — TODO: BACKEND usar bcrypt real
export function mockHash(password: string): string {
  return `mock_hash_${btoa(password)}`;
}

export function createId(): string {
  return crypto.randomUUID();
}

function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}

// ---- USUARIOS ----
export const SEED_USERS: User[] = [
  { id: createId(), username: 'admin',      passwordHash: mockHash('Admin123!'),      name: 'Administrador Sistema', email: 'admin@epsilon.demo',      role: 'admin',      active: true, createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  { id: createId(), username: 'cajero',     passwordHash: mockHash('Cajero123!'),     name: 'Carlos Guardado',       email: 'cajero@epsilon.demo',     role: 'cajero',     active: true, createdAt: daysAgo(45), updatedAt: daysAgo(45) },
  { id: createId(), username: 'supervisor', passwordHash: mockHash('Supervisor123!'), name: 'María López',           email: 'supervisor@epsilon.demo', role: 'supervisor', active: true, createdAt: daysAgo(50), updatedAt: daysAgo(50) },
  { id: createId(), username: 'contador',   passwordHash: mockHash('Contador123!'),   name: 'Roberto Díaz',          email: 'contador@epsilon.demo',   role: 'contador',   active: true, createdAt: daysAgo(30), updatedAt: daysAgo(30) },
];

// ---- CONFIGURACIÓN EMPRESA ----
export const SEED_SETTINGS: CompanySettings = {
  name: 'Grupo Epsilon, S.A. de C.V.',
  tradeName: 'Epsilon Distribuciones',
  nit: '0614-150190-101-0',
  nrc: '123456-7',
  address: 'Colonia Escalón, Calle La Mascota #25, San Salvador',
  department: 'San Salvador',
  municipality: 'San Salvador',
  phone: '2222-3333',
  email: 'info@epsilon.demo',
  website: 'www.epsilon.demo',
  economicActivity: 'Comercio al por mayor y menor',
  ivaRate: 0.13,
  invoicePrefix: 'FAC',
  ccfPrefix: 'CCF',
  nextInvoiceNumber: 1,
  nextCCFNumber: 1,
  nextCreditNoteNumber: 1,
  contingencyEnabled: false,
  simulateOffline: false,
  logoDataUrl: '',
};

// ---- CLIENTES ----
const DEPTS = ['San Salvador','Santa Ana','San Miguel','Usulután','Sonsonate','La Libertad'];
const MUNIS = ['San Salvador','Santa Ana','San Miguel','Usulután','Sonsonate','Antiguo Cuscatlán'];

export const SEED_CUSTOMERS: Customer[] = [
  { id: createId(), personType:'juridica',  name:'Supermercados El Colono, S.A.',  nit:'0614-010101-001-1', nrc:'111111-1', dui:'',           email:'colono@demo.com',    phone:'2299-0001', address:'Av. Bernal, Local 1',  department:DEPTS[0], municipality:MUNIS[0], taxpayerType:'grande',   ivaExempt:false, active:true, createdAt:daysAgo(50), updatedAt:daysAgo(50) },
  { id: createId(), personType:'natural',   name:'Juan Alberto Martínez',          nit:'0614-020202-002-2', nrc:'',         dui:'02020202-2', email:'juan.m@demo.com',    phone:'7777-0002', address:'Res. Santa Clara #5',  department:DEPTS[1], municipality:MUNIS[1], taxpayerType:'pequeño',  ivaExempt:false, active:true, createdAt:daysAgo(48), updatedAt:daysAgo(48) },
  { id: createId(), personType:'juridica',  name:'Farmacia San Rafael, S.A.',      nit:'0614-030303-003-3', nrc:'222222-2', dui:'',           email:'sanrafael@demo.com', phone:'2399-0003', address:'Calle Arce #100',      department:DEPTS[2], municipality:MUNIS[2], taxpayerType:'mediano',  ivaExempt:false, active:true, createdAt:daysAgo(45), updatedAt:daysAgo(45) },
  { id: createId(), personType:'natural',   name:'Ana Cristina Flores',            nit:'0614-040404-004-4', nrc:'',         dui:'04040404-4', email:'ana.f@demo.com',     phone:'7777-0004', address:'Col. Layco #14',       department:DEPTS[3], municipality:MUNIS[3], taxpayerType:'pequeño',  ivaExempt:false, active:true, createdAt:daysAgo(42), updatedAt:daysAgo(42) },
  { id: createId(), personType:'juridica',  name:'Ferretería El Ángel, S.A.',     nit:'0614-050505-005-5', nrc:'333333-3', dui:'',           email:'angel@demo.com',     phone:'2499-0005', address:'Blvd. Venezuela #22',  department:DEPTS[4], municipality:MUNIS[4], taxpayerType:'mediano',  ivaExempt:false, active:true, createdAt:daysAgo(40), updatedAt:daysAgo(40) },
  { id: createId(), personType:'natural',   name:'Pedro Nolasco Reyes',            nit:'0614-060606-006-6', nrc:'',         dui:'06060606-6', email:'pedro.r@demo.com',   phone:'7777-0006', address:'Bo. San Jacinto #8',   department:DEPTS[5], municipality:MUNIS[5], taxpayerType:'excluido', ivaExempt:true,  active:true, createdAt:daysAgo(38), updatedAt:daysAgo(38) },
  { id: createId(), personType:'juridica',  name:'Distribuidora Global Tech',      nit:'0614-070707-007-7', nrc:'444444-4', dui:'',           email:'global@demo.com',    phone:'2599-0007', address:'Centro Comercial Galerías L-3', department:DEPTS[0], municipality:MUNIS[0], taxpayerType:'grande', ivaExempt:false, active:true, createdAt:daysAgo(35), updatedAt:daysAgo(35) },
  { id: createId(), personType:'natural',   name:'Karla Beatriz Herrera',          nit:'0614-080808-008-8', nrc:'',         dui:'08080808-8', email:'karla.h@demo.com',   phone:'7777-0008', address:'Urb. Lomas de Altamira #4', department:DEPTS[1], municipality:MUNIS[1], taxpayerType:'pequeño', ivaExempt:false, active:true, createdAt:daysAgo(30), updatedAt:daysAgo(30) },
  { id: createId(), personType:'juridica',  name:'Hospital Diagnóstico, S.A.',     nit:'0614-090909-009-9', nrc:'555555-5', dui:'',           email:'diagnostico@demo.com',phone:'2699-0009', address:'Col. Médica, Blvd. Quirúrgico', department:DEPTS[2], municipality:MUNIS[2], taxpayerType:'grande', ivaExempt:true,  active:true, createdAt:daysAgo(25), updatedAt:daysAgo(25) },
  { id: createId(), personType:'natural',   name:'Luis Ernesto Campos',            nit:'0614-101010-010-0', nrc:'',         dui:'10101010-0', email:'luis.c@demo.com',    phone:'7777-0010', address:'Apdo. Postal 2020',    department:DEPTS[3], municipality:MUNIS[3], taxpayerType:'excluido', ivaExempt:false, active:false, createdAt:daysAgo(20), updatedAt:daysAgo(5) },
];

// ---- PRODUCTOS (precios en centavos) ----
const CATS = ['Electrónica','Alimentos','Limpieza','Papelería','Herramientas','Farmacia','Tecnología','Ropa'];

export const SEED_PRODUCTS: Product[] = [
  { id:createId(), code:'ELEC-001', name:'Laptop HP 15" Core i5',        description:'Laptop 8GB RAM 512 SSD',          category:CATS[0], price:80000, applyIva:true,  stock:15, minStock:3,  unit:'unidad', active:true, createdAt:daysAgo(60), updatedAt:daysAgo(10) },
  { id:createId(), code:'ELEC-002', name:'Monitor Samsung 24"',           description:'Monitor Full HD IPS',              category:CATS[0], price:25000, applyIva:true,  stock:8,  minStock:2,  unit:'unidad', active:true, createdAt:daysAgo(60), updatedAt:daysAgo(8) },
  { id:createId(), code:'ALIM-001', name:'Arroz Integral 1 lb',           description:'Arroz integral selecto',           category:CATS[1], price:150,   applyIva:false, stock:500,minStock:50, unit:'kg',     active:true, createdAt:daysAgo(55), updatedAt:daysAgo(2) },
  { id:createId(), code:'ALIM-002', name:'Aceite Oleico 1 lt',            description:'Aceite vegetal para cocina',       category:CATS[1], price:280,   applyIva:false, stock:200,minStock:30, unit:'litro',  active:true, createdAt:daysAgo(55), updatedAt:daysAgo(3) },
  { id:createId(), code:'LIMP-001', name:'Detergente Líquido 1 lt',       description:'Detergente concentrado multiusos', category:CATS[2], price:350,   applyIva:true,  stock:120,minStock:20, unit:'litro',  active:true, createdAt:daysAgo(50), updatedAt:daysAgo(1) },
  { id:createId(), code:'LIMP-002', name:'Cloro 1 lt',                    description:'Blanqueador multiusos',            category:CATS[2], price:200,   applyIva:true,  stock:80, minStock:15, unit:'litro',  active:true, createdAt:daysAgo(50), updatedAt:daysAgo(4) },
  { id:createId(), code:'PAPE-001', name:'Resma Papel Bond A4',           description:'500 hojas 75g/m²',                 category:CATS[3], price:600,   applyIva:true,  stock:60, minStock:10, unit:'paquete', active:true, createdAt:daysAgo(45), updatedAt:daysAgo(5) },
  { id:createId(), code:'PAPE-002', name:'Boligrafo BIC Azul (caja 12)', description:'Bolígrafos punto medio',           category:CATS[3], price:250,   applyIva:true,  stock:4,  minStock:5,  unit:'caja',   active:true, createdAt:daysAgo(45), updatedAt:daysAgo(6) },
  { id:createId(), code:'HERR-001', name:'Taladro Black & Decker 3/8"', description:'Taladro percutor 550W',            category:CATS[4], price:6500,  applyIva:true,  stock:10, minStock:2,  unit:'unidad', active:true, createdAt:daysAgo(40), updatedAt:daysAgo(7) },
  { id:createId(), code:'HERR-002', name:'Set Destornilladores x12',      description:'Juego destornilladores punta',     category:CATS[4], price:2200,  applyIva:true,  stock:25, minStock:5,  unit:'unidad', active:true, createdAt:daysAgo(40), updatedAt:daysAgo(8) },
  { id:createId(), code:'FARM-001', name:'Acetaminofén 500mg x24',        description:'Analgésico/antipirético',          category:CATS[5], price:320,   applyIva:false, stock:200,minStock:50, unit:'unidad', active:true, createdAt:daysAgo(35), updatedAt:daysAgo(2) },
  { id:createId(), code:'FARM-002', name:'Vitamina C 1000mg x30',         description:'Suplemento vitamínico',            category:CATS[5], price:850,   applyIva:false, stock:80, minStock:20, unit:'unidad', active:true, createdAt:daysAgo(35), updatedAt:daysAgo(3) },
  { id:createId(), code:'TECH-001', name:'USB Hub 7 puertos USB 3.0',     description:'Concentrador USB con alimentación', category:CATS[6], price:2800,  applyIva:true,  stock:20, minStock:3,  unit:'unidad', active:true, createdAt:daysAgo(30), updatedAt:daysAgo(9) },
  { id:createId(), code:'TECH-002', name:'Mouse Inalámbrico Logitech',    description:'Mouse ergonómico 2.4GHz',          category:CATS[6], price:1800,  applyIva:true,  stock:30, minStock:5,  unit:'unidad', active:true, createdAt:daysAgo(30), updatedAt:daysAgo(7) },
  { id:createId(), code:'TECH-003', name:'Teclado Mecánico RGB',          description:'Teclado gaming switches azules',   category:CATS[6], price:5500,  applyIva:true,  stock:12, minStock:2,  unit:'unidad', active:true, createdAt:daysAgo(28), updatedAt:daysAgo(6) },
  { id:createId(), code:'ROPA-001', name:'Camiseta Polo Hombre M',        description:'Camiseta tipo polo algodón',        category:CATS[7], price:1500,  applyIva:true,  stock:2,  minStock:5,  unit:'unidad', active:true, createdAt:daysAgo(25), updatedAt:daysAgo(5) },
  { id:createId(), code:'ROPA-002', name:'Pantalón Jean Slim 32',         description:'Pantalón mezclilla slim fit',       category:CATS[7], price:3500,  applyIva:true,  stock:18, minStock:3,  unit:'unidad', active:true, createdAt:daysAgo(25), updatedAt:daysAgo(4) },
  { id:createId(), code:'ELEC-003', name:'Audífonos Sony WH-1000XM4',    description:'Audífonos NC inalámbricos',         category:CATS[0], price:22000, applyIva:true,  stock:6,  minStock:1,  unit:'unidad', active:true, createdAt:daysAgo(20), updatedAt:daysAgo(3) },
  { id:createId(), code:'LIMP-003', name:'Desinfectante Pino 1 lt',       description:'Desinfectante de pisos aroma pino',category:CATS[2], price:280,   applyIva:true,  stock:90, minStock:20, unit:'litro',  active:true, createdAt:daysAgo(15), updatedAt:daysAgo(2) },
  { id:createId(), code:'TECH-004', name:'Webcam Full HD 1080p',          description:'Cámara web con micrófono',         category:CATS[6], price:4200,  applyIva:true,  stock:0,  minStock:2,  unit:'unidad', active:true, createdAt:daysAgo(10), updatedAt:daysAgo(1) },
];

// Generar ventas/DTE históricos se hace dinámicamente desde initializeSeeds
export function buildSeedDTEs(
  customers: Customer[],
  products: Product[],
  users: User[],
  settings: CompanySettings,
): { sales: Sale[]; dtes: DTE[]; ars: AccountReceivable[]; movements: InventoryMovement[]; audits: AuditLog[] } {
  const sales: Sale[] = [];
  const dtes: DTE[] = [];
  const ars: AccountReceivable[] = [];
  const movements: InventoryMovement[] = [];
  const audits: AuditLog[] = [];

  const admin = users.find(u => u.role === 'admin')!;
  const cajero = users.find(u => u.role === 'cajero')!;

  function mkItems(prods: Product[], qty: number[]): import('../types').SaleItem[] {
    return prods.map((p, i) => {
      const q = qty[i] || 1;
      const sub = p.price * q;
      const disc = 0;
      const taxBase = sub - disc;
      const iva = p.applyIva ? Math.round(taxBase * 0.13) : 0;
      return {
        productId: p.id, productCode: p.code, productName: p.name,
        quantity: q, unitPrice: p.price,
        discount: 0, subtotal: sub, discountTotal: disc,
        taxableBase: taxBase, iva, total: taxBase + iva, applyIva: p.applyIva,
      };
    });
  }

  function mkSale(cust: Customer, prods: Product[], qty: number[], daysBack: number, pm: import('../types').PaymentMethod, user: User): Sale {
    const items = mkItems(prods, qty);
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const totalDiscount = 0;
    const taxableBase = items.reduce((s, i) => s + i.taxableBase, 0);
    const iva = items.reduce((s, i) => s + i.iva, 0);
    const total = taxableBase + iva;
    return {
      id: createId(), customerId: cust.id, customerName: cust.name, items,
      subtotal, totalDiscount, taxableBase, iva, total,
      paymentMethod: pm, dteId: null,
      userId: user.id, userName: user.name,
      createdAt: daysAgo(daysBack), notes: '',
    };
  }

  function mkDTE(sale: Sale, type: import('../types').DteType, num: number, status: import('../types').DteStatus, mode: import('../types').EmissionMode, cust: Customer, daysBack: number): DTE {
    const prefix = type === 'factura' ? settings.invoicePrefix : settings.ccfPrefix;
    const controlNumber = `${prefix}-${String(num).padStart(8,'0')}`;
    const genCode = createId().replace(/-/g,'').toUpperCase().slice(0,32);
    const qrData = `https://demo.facturacion.local/verify/${genCode}`;
    const dt = new Date(sale.createdAt);
    return {
      id: createId(),
      type, controlNumber, generationCode: genCode,
      emissionDate: dt.toISOString().slice(0,10),
      emissionTime: dt.toISOString().slice(11,19),
      emitter: {
        name: settings.name, nit: settings.nit, nrc: settings.nrc,
        address: settings.address, phone: settings.phone, email: settings.email,
        economicActivity: settings.economicActivity,
      },
      receiver: {
        customerId: cust.id, name: cust.name, nit: cust.nit, nrc: cust.nrc,
        dui: cust.dui, address: cust.address, email: cust.email,
        taxpayerType: cust.taxpayerType, ivaExempt: cust.ivaExempt,
      },
      items: sale.items,
      summary: {
        subtotal: sale.subtotal, totalDiscount: sale.totalDiscount,
        taxableBase: sale.taxableBase, iva: sale.iva, total: sale.total,
      },
      status, emissionMode: mode,
      signed: status !== 'borrador',
      signatureSimulated: status !== 'borrador' ? `SIM-${genCode.slice(0,16)}` : null,
      transmitted: status === 'transmitido',
      transmittedAt: status === 'transmitido' ? daysAgo(daysBack - 0.01) : null,
      saleId: sale.id, relatedDteId: null, creditNoteReason: null,
      qrData, rejectionReason: null,
      createdAt: daysAgo(daysBack), updatedAt: daysAgo(daysBack),
    };
  }

  // Generar 8 ventas históricas
  const scenarios: Array<{ ci: number; pi: number[]; qi: number[]; days: number; pm: import('../types').PaymentMethod; type: import('../types').DteType; status: import('../types').DteStatus; mode: import('../types').EmissionMode; user: User }> = [
    { ci:0, pi:[0,1],     qi:[1,2],   days:15, pm:'efectivo',     type:'factura',     status:'transmitido',          mode:'NORMAL',       user:cajero },
    { ci:2, pi:[6,7,9],   qi:[3,5,2], days:14, pm:'transferencia', type:'ccf',         status:'transmitido',          mode:'NORMAL',       user:cajero },
    { ci:4, pi:[8,10],    qi:[1,1],   days:12, pm:'tarjeta',       type:'factura',     status:'transmitido',          mode:'NORMAL',       user:cajero },
    { ci:1, pi:[11,12],   qi:[2,3],   days:10, pm:'efectivo',      type:'factura',     status:'contingencia',         mode:'CONTINGENCIA', user:cajero },
    { ci:6, pi:[0,13,14], qi:[1,2,1], days:8,  pm:'credito',       type:'ccf',         status:'transmitido',          mode:'NORMAL',       user:admin },
    { ci:3, pi:[2,3,4],   qi:[10,5,6],days:6,  pm:'efectivo',      type:'factura',     status:'pendiente_transmision', mode:'NORMAL',      user:cajero },
    { ci:8, pi:[17,18],   qi:[1,2],   days:4,  pm:'transferencia', type:'ccf',         status:'rechazado',            mode:'NORMAL',       user:admin },
    { ci:0, pi:[15,16],   qi:[2,1],   days:2,  pm:'tarjeta',       type:'factura',     status:'transmitido',          mode:'NORMAL',       user:cajero },
  ];

  scenarios.forEach((sc, idx) => {
    const cust = customers[sc.ci];
    const prods = sc.pi.map(i => products[i]);
    const sale = mkSale(cust, prods, sc.qi, sc.days, sc.pm, sc.user);
    const dte = mkDTE(sale, sc.type, idx + 1, sc.status, sc.mode, cust, sc.days);
    sale.dteId = dte.id;
    sales.push(sale);
    dtes.push(dte);

    // A/R para crédito
    if (sc.pm === 'credito') {
      const due = new Date(sale.createdAt);
      due.setDate(due.getDate() + 30);
      ars.push({
        id: createId(),
        customerId: cust.id, customerName: cust.name,
        dteId: dte.id, dteControlNumber: dte.controlNumber,
        issueDate: sale.createdAt, dueDate: due.toISOString(),
        amount: sale.total, paid: 0, balance: sale.total, status: 'pendiente',
        createdAt: sale.createdAt, updatedAt: sale.createdAt,
      });
    }

    // Auditoría
    audits.push({
      id: createId(), userId: sc.user.id, userName: sc.user.name,
      action: 'CREATE', module: 'DTE', entityType: 'DTE', entityId: dte.id,
      description: `${sc.user.name} emitió ${sc.type.toUpperCase()} ${dte.controlNumber} por $${(dte.summary.total/100).toFixed(2)}`,
      createdAt: sale.createdAt,
    });
  });

  // Movimientos de inventario ejemplo
  products.slice(0,5).forEach((p, i) => {
    movements.push({
      id: createId(), productId: p.id, productName: p.name,
      type: 'entrada', quantity: 20, previousStock: p.stock - 20, newStock: p.stock,
      reason: 'Compra inicial de inventario', userId: admin.id, userName: admin.name,
      createdAt: daysAgo(60 - i * 5),
    });
  });

  return { sales, dtes, ars, movements, audits };
}
