// ============================================================
// DTE SERVICE — Generación y simulación de DTE
// TODO: BACKEND — integrar con API real del Ministerio de Hacienda
// ============================================================
import type { DTE, DteType, Sale, Customer, CompanySettings, DteStatus } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import connectivityService from '../connectivity/connectivityService';
import { createId } from '../../mock/seeds';

// Abstracción de firma digital — TODO: BACKEND implementar con certificado real
interface DigitalSignatureService {
  sign(documentId: string): string;
}

// TODO: BACKEND — reemplazar por MockDigitalSignatureService con backend real
class MockDigitalSignatureService implements DigitalSignatureService {
  sign(documentId: string): string {
    // SIMULACIÓN — no es una firma criptográfica real
    const hash = btoa(`SIM:${documentId}:${Date.now()}`).slice(0, 32);
    return `SIM-FIRMA-${hash.toUpperCase()}`;
  }
}

const sigSvc = new MockDigitalSignatureService();

const dteService = {
  getNextControlNumber(type: DteType, settings: CompanySettings): string {
    let prefix: string;
    let num: number;
    if (type === 'factura') {
      prefix = settings.invoicePrefix;
      num = settings.nextInvoiceNumber;
    } else if (type === 'ccf') {
      prefix = settings.ccfPrefix;
      num = settings.nextCCFNumber;
    } else {
      prefix = 'NC';
      num = settings.nextCreditNoteNumber;
    }
    return `${prefix}-${String(num).padStart(8, '0')}`;
  },

  incrementCounter(type: DteType): void {
    const settings = storageService.get<CompanySettings>(KEYS.SETTINGS);
    if (!settings) return;
    if (type === 'factura') settings.nextInvoiceNumber++;
    else if (type === 'ccf') settings.nextCCFNumber++;
    else settings.nextCreditNoteNumber++;
    storageService.set(KEYS.SETTINGS, settings);
  },

  generateDTE(sale: Sale, type: DteType, customer: Customer, settings: CompanySettings): DTE {
    const online = connectivityService.isOnline();
    const mode = online ? 'NORMAL' : 'CONTINGENCIA';
    const status: DteStatus = online ? 'generado' : 'contingencia';
    const controlNumber = this.getNextControlNumber(type, settings);
    const generationCode = createId().replace(/-/g, '').toUpperCase().slice(0, 32);
    const now = new Date();

    const dte: DTE = {
      id: createId(),
      type,
      controlNumber,
      generationCode,
      emissionDate: now.toISOString().slice(0, 10),
      emissionTime: now.toISOString().slice(11, 19),
      emitter: {
        name: settings.name,
        nit: settings.nit,
        nrc: settings.nrc,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        economicActivity: settings.economicActivity,
      },
      receiver: {
        customerId: customer.id,
        name: customer.name,
        nit: customer.nit,
        nrc: customer.nrc,
        dui: customer.dui,
        address: customer.address,
        email: customer.email,
        taxpayerType: customer.taxpayerType,
        ivaExempt: customer.ivaExempt,
      },
      items: sale.items,
      summary: {
        subtotal: sale.subtotal,
        totalDiscount: sale.totalDiscount,
        taxableBase: sale.taxableBase,
        iva: sale.iva,
        total: sale.total,
      },
      status,
      emissionMode: mode,
      signed: false,
      signatureSimulated: null,
      transmitted: false,
      transmittedAt: null,
      saleId: sale.id,
      relatedDteId: null,
      creditNoteReason: null,
      qrData: `https://demo.facturacion.local/verify/${generationCode}`,
      rejectionReason: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return dte;
  },

  simulateDigitalSignature(dte: DTE): DTE {
    // SIMULACIÓN — no es firma real
    const sig = sigSvc.sign(dte.id);
    return { ...dte, signed: true, signatureSimulated: sig, status: 'pendiente_transmision', updatedAt: new Date().toISOString() };
  },

  async simulateTransmission(dte: DTE): Promise<DTE> {
    // TODO: BACKEND — reemplazar por llamada HTTP real a API de MH
    await new Promise(r => setTimeout(r, 800)); // simular latencia
    const online = connectivityService.isOnline();
    if (!online) {
      return { ...dte, status: 'contingencia', emissionMode: 'CONTINGENCIA', updatedAt: new Date().toISOString() };
    }
    return {
      ...dte,
      status: 'transmitido',
      transmitted: true,
      transmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  save(dte: DTE): void {
    storageService.appendToArray<DTE>(KEYS.DTES, dte);
  },

  update(dte: DTE): void {
    storageService.updateInArray<DTE>(KEYS.DTES, dte);
  },

  getAll(): DTE[] {
    return storageService.getArray<DTE>(KEYS.DTES)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): DTE | null {
    return storageService.getArray<DTE>(KEYS.DTES).find(d => d.id === id) ?? null;
  },

  generateQRData(dte: DTE): string {
    return dte.qrData;
  },
};

export default dteService;
