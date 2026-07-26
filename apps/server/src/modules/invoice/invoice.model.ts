import { Schema, model, type HydratedDocument } from 'mongoose';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface InvoiceDocument {
  _id: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  appointmentId?: Schema.Types.ObjectId;
  consultationId?: Schema.Types.ObjectId;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedInvoice = HydratedDocument<InvoiceDocument>;

const invoiceItemSchema = new Schema<InvoiceItem>(
  { description: { type: String, required: true }, amount: { type: Number, required: true } },
  { _id: false },
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'issued', 'paid', 'void'], default: 'issued' },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const InvoiceModel = model<InvoiceDocument>('Invoice', invoiceSchema);
