/** Admin-only. hospitalId is deliberately absent — always the creating admin's own hospital (see doctor.controller.ts). */
export interface CreateDoctorInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialization: string[];
  licenseNumber?: string;
}

/** hospitalId is intentionally not editable here — fixed at creation time (see CreateDoctorInput). */
export interface UpdateDoctorProfileInput {
  specialization?: string[];
  licenseNumber?: string;
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  availability?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes?: number;
  }>;
  bio?: string;
  department?: string;
}

export interface ListDoctorsQuery {
  page?: number;
  limit?: number;
  search?: string;
  hospitalId?: string;
  specialization?: string;
}
