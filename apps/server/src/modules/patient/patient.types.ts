/** Used by the Health Officer "Register Patient" front-desk flow — hospital is auto-filled from the officer's own hospital, password is chosen by the officer. */
export interface CreatePatientInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  age: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdatePatientProfileInput {
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string[];
  chronicConditions?: string[];
  assignedDoctorId?: string;
}

export interface ListPatientsQuery {
  page?: number;
  limit?: number;
  search?: string;
  hospitalId?: string;
  assignedDoctorId?: string;
}
