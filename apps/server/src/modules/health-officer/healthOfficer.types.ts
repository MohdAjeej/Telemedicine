export interface CreateHealthOfficerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  hospitalId?: string;
  employeeId?: string;
}

export interface UpdateHealthOfficerProfileInput {
  hospitalId?: string;
  assignedClinic?: string;
  certifications?: string[];
  employeeId?: string;
}

export interface ListHealthOfficersQuery {
  page?: number;
  limit?: number;
  hospitalId?: string;
}
