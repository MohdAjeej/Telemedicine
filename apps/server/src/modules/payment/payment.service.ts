import { ApiError } from '../../helpers/ApiError';
import { invoiceRepository } from '../invoice/invoice.repository';
import { paymentRepository } from './payment.repository';

/**
 * Payment capture is simulated (no real gateway integration in this
 * environment) — a payment is recorded as "succeeded" immediately, which is
 * enough to exercise the invoice → payment relationship end to end. Swapping
 * in a real gateway (Stripe/Razorpay) means replacing only this function's
 * body with the gateway's charge call.
 */
export const paymentService = {
  async pay(input: { invoiceId: string; patientId: string; amount: number; method: 'card' | 'upi' | 'insurance' }) {
    const invoice = await invoiceRepository.findById(input.invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');
    if (invoice.status === 'paid') throw ApiError.badRequest('Invoice is already paid');

    const payment = await paymentRepository.create({
      ...input,
      gatewayRef: `SIMULATED-${Date.now()}`,
    });
    const succeeded = await paymentRepository.updateStatus(payment._id.toString(), 'succeeded');
    await invoiceRepository.updateStatus(input.invoiceId, 'paid');

    return succeeded;
  },

  async listForPatient(patientId: string) {
    return paymentRepository.findByPatientId(patientId);
  },

  async getById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw ApiError.notFound('Payment not found');
    return payment;
  },
};
