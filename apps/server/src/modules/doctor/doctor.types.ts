export interface CreateDoctorInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  hospitalId?: string;
  specialization?: string[];
  licenseNumber?: string;
}

export interface UpdateDoctorProfileInput {
  hospitalId?: string;
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
