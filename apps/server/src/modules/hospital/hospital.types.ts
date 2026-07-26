export interface CreateHospitalInput {
  name: string;
  registrationNumber: string;
  type: 'clinic' | 'hospital' | 'multi_specialty';
  phone: string;
  email: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  departments?: string[];
}

export type UpdateHospitalInput = Partial<CreateHospitalInput> & { status?: 'active' | 'inactive' };

export interface ListHospitalsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}
