/** Admin-only. hospitalId is deliberately absent — always the creating admin's own hospital (see healthOfficer.controller.ts). */
export interface CreateHealthOfficerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
}

/** hospitalId is intentionally not editable here — fixed at creation time. */
export interface UpdateHealthOfficerProfileInput {
  assignedClinic?: string;
  certifications?: string[];
  employeeId?: string;
}

export interface ListHealthOfficersQuery {
  page?: number;
  limit?: number;
  hospitalId?: string;
}
