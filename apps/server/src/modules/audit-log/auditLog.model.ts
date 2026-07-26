import { Schema, model, type InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId },
    ip: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;
export const AuditLogModel = model('AuditLog', auditLogSchema);
