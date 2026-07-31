export interface CreateAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  permissions?: string[];
  department?: string;
}

export interface UpdateAdminProfileInput {
  hospitalId?: string;
  permissions?: string[];
  department?: string;
}
