import type { AppointmentStatus, AppointmentType } from './appointment.model';

export interface BookAppointmentInput {
  doctorId: string;
  hospitalId: string;
  scheduledStart: string;
  scheduledEnd?: string;
  type: AppointmentType;
  reasonForVisit: string;
}

export interface ListAppointmentsQuery {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export interface RequestActor {
  userId: string;
  role: string;
}
