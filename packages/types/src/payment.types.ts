import type { BaseEntity } from './common.types';

export type PaymentMethod = 'card' | 'upi' | 'insurance';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment extends BaseEntity {
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayRef?: string;
  paidAt?: string;
}
