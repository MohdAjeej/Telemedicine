import type { AuditLog, PaginatedResult } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

export const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAuditLogs: builder.query<PaginatedResult<AuditLog>, AuditLogListParams | void>({
      query: (params) => ({ url: '/audit-logs', params: params ?? {} }),
      transformResponse: (response: { data: AuditLog[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: [{ type: 'AuditLog', id: 'LIST' }],
    }),
  }),
});

export const { useListAuditLogsQuery } = auditLogApi;
