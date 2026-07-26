export interface CreatePatientInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdatePatientProfileInput {
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
  assignedDoctorId?: string;
}
