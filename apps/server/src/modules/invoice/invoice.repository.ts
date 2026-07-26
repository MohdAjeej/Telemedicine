import { InvoiceModel, type HydratedInvoice, type InvoiceItem, type InvoiceStatus } from './invoice.model';

export const invoiceRepository = {
  create(input: {
    patientId: string;
    appointmentId?: string;
    consultationId?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    dueDate: Date;
  }): Promise<HydratedInvoice> {
    return InvoiceModel.create(input);
  },

  findById(id: string): Promise<HydratedInvoice | null> {
    return InvoiceModel.findById(id).exec();
  },

  findByPatientId(patientId: string): Promise<HydratedInvoice[]> {
    return InvoiceModel.find({ patientId }).sort({ createdAt: -1 }).exec();
  },

  updateStatus(id: string, status: InvoiceStatus): Promise<HydratedInvoice | null> {
    return InvoiceModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
  },
};
