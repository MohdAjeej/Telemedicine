import type { AppointmentStatus } from './appointment.model';

export interface BookAppointmentInput {
  doctorId: string;
  hospitalId: string;
  scheduledStart: string;
  scheduledEnd?: string;
  reasonForVisit: string;
  /** Required — Health Officers are the only actors who can book, always on behalf of a patient. */
  patientId: string;
}

export interface RescheduleAppointmentInput {
  scheduledStart: string;
  scheduledEnd?: string;
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
  hospitalId?: string;
}
