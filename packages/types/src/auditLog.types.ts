import type { BaseEntity } from './common.types';

export interface AuditLog extends BaseEntity {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}
