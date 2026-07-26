import { PaymentModel, type HydratedPayment, type PaymentStatus } from './payment.model';

export const paymentRepository = {
  create(input: {
    invoiceId: string;
    patientId: string;
    amount: number;
    method: 'card' | 'upi' | 'insurance';
    gatewayRef?: string;
  }): Promise<HydratedPayment> {
    return PaymentModel.create(input);
  },

  findByPatientId(patientId: string): Promise<HydratedPayment[]> {
    return PaymentModel.find({ patientId }).sort({ createdAt: -1 }).exec();
  },

  findById(id: string): Promise<HydratedPayment | null> {
    return PaymentModel.findById(id).exec();
  },

  updateStatus(id: string, status: PaymentStatus): Promise<HydratedPayment | null> {
    const update: Record<string, unknown> = { status };
    if (status === 'succeeded') update.paidAt = new Date();
    return PaymentModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
  },
};
