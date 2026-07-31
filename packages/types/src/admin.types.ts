import type { BaseEntity } from './common.types';

export interface Admin extends BaseEntity {
  userId: string;
  hospitalId: string;
  permissions: string[];
  department?: string;
}
