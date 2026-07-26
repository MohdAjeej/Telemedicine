import { ApiError } from '../../helpers/ApiError';
import { invoiceRepository } from './invoice.repository';
import type { InvoiceItem, InvoiceStatus } from './invoice.model';

const TAX_RATE = 0.0;

export const invoiceService = {
  async create(input: {
    patientId: string;
    appointmentId?: string;
    consultationId?: string;
    items: InvoiceItem[];
    dueDate: string;
  }) {
    const subtotal = input.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    return invoiceRepository.create({
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      consultationId: input.consultationId,
      items: input.items,
      subtotal,
      tax,
      total,
      dueDate: new Date(input.dueDate),
    });
  },

  async listForPatient(patientId: string) {
    return invoiceRepository.findByPatientId(patientId);
  },

  async getById(id: string) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return invoice;
  },

  async updateStatus(id: string, status: InvoiceStatus) {
    const invoice = await invoiceRepository.updateStatus(id, status);
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return invoice;
  },
};
