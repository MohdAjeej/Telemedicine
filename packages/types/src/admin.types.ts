import type { BaseEntity } from './common.types';

export interface Admin extends BaseEntity {
  userId: string;
  permissions: string[];
  department?: string;
}
