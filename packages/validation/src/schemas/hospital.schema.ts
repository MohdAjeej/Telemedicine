import { z } from 'zod';

export const hospitalSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  registrationNumber: z.string().min(2, 'Registration number is required'),
  type: z.enum(['clinic', 'hospital', 'multi_specialty']),
  phone: z.string().min(5, 'Phone is required'),
  email: z.string().email('Enter a valid email address'),
  website: z.string().url().optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export type HospitalInput = z.infer<typeof hospitalSchema>;
