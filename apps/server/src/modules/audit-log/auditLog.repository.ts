import { AuditLogModel } from './auditLog.model';

export interface ListAuditLogsQuery {
  page?: number;
  limit?: number;
  actorId?: string;
  hospitalId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

export const auditLogRepository = {
  async findMany(query: ListAuditLogsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = {};

    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.actorId) filter.actorId = query.actorId;
    if (query.action) filter.action = query.action;
    if (query.entityType) filter.entityType = query.entityType;
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      AuditLogModel.find(filter)
        .populate('actorId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      AuditLogModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },
};
