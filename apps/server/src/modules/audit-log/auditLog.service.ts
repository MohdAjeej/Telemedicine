import { AuditLogModel } from './auditLog.model';

export interface RecordAuditLogInput {
  actorId?: string;
  hospitalId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write-only helper other modules call to leave an audit trail. Reading
 * back (list + filter for the Admin "Audit Logs" screen) is added in
 * Phase 4 once auditLog.controller.ts / auditLog.routes.ts exist.
 */
export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  await AuditLogModel.create(input);
}
