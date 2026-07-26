import { useState } from 'react';
import { Grid, TextField } from '@mui/material';
import { format } from 'date-fns';
import { DataTable, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { AuditLog } from '@telemedicine/types';
import { useListAuditLogsQuery } from '../../features/auditLog/auditLogApi';

function actorLabel(entity: unknown): string {
  const populated = entity as { firstName?: string; lastName?: string; email?: string } | undefined;
  if (!populated) return 'System';
  if (populated.firstName || populated.lastName) {
    return `${populated.firstName ?? ''} ${populated.lastName ?? ''}`.trim();
  }
  return populated.email ?? 'Unknown';
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isFetching } = useListAuditLogsQuery({
    page: page + 1,
    limit: 20,
    action: action || undefined,
    entityType: entityType || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });

  const columns: DataTableColumn<AuditLog>[] = [
    { key: 'when', header: 'When', render: (row) => format(new Date(row.createdAt), 'MMM d, yyyy p') },
    { key: 'actor', header: 'Actor', render: (row) => actorLabel(row.actorId) },
    { key: 'action', header: 'Action', render: (row) => row.action },
    { key: 'entity', header: 'Entity', render: (row) => `${row.entityType}${row.entityId ? ` (${row.entityId.slice(-6)})` : ''}` },
    { key: 'ip', header: 'IP', render: (row) => row.ip ?? '—' },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Security and activity trail across the platform" />
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            size="small"
            fullWidth
            label="Action"
            placeholder="e.g. appointment.confirmed"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(0);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            size="small"
            fullWidth
            label="Entity type"
            placeholder="e.g. Appointment"
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(0);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            size="small"
            fullWidth
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(0);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            size="small"
            fullWidth
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(0);
            }}
          />
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row._id}
        loading={isFetching}
        page={page}
        rowsPerPage={20}
        totalCount={data?.total ?? 0}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        emptyTitle="No audit log entries match these filters"
      />
    </>
  );
}
