import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Select a doctor'),
  hospitalId: z.string().min(1, 'Select a hospital'),
  patientId: z.string().min(1, 'Select a patient'),
  scheduledStart: z.string().min(1, 'Select a date and time'),
  type: z.enum(['in_person', 'video']),
  reasonForVisit: z.string().min(3, 'Please describe the reason for your visit'),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
