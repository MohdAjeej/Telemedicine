import { Schema, model, type HydratedDocument } from 'mongoose';

export type PaymentMethod = 'card' | 'upi' | 'insurance';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentDocument {
  _id: Schema.Types.ObjectId;
  invoiceId: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayRef?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedPayment = HydratedDocument<PaymentDocument>;

const paymentSchema = new Schema<PaymentDocument>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['card', 'upi', 'insurance'], required: true },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    gatewayRef: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export const PaymentModel = model<PaymentDocument>('Payment', paymentSchema);
