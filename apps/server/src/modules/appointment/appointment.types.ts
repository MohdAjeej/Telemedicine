import type { AppointmentStatus, AppointmentType } from './appointment.model';

export interface BookAppointmentInput {
  doctorId: string;
  hospitalId: string;
  scheduledStart: string;
  scheduledEnd?: string;
  type: AppointmentType;
  reasonForVisit: string;
  /** Required — Health Officers are the only actors who can book, always on behalf of a patient. */
  patientId: string;
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
