import type { BaseEntity } from './common.types';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice extends BaseEntity {
  patientId: string;
  appointmentId?: string;
  consultationId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
}
