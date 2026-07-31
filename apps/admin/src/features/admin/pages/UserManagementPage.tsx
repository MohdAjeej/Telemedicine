import { useState } from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { DataTable, PageHeader, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { UserRole } from '@telemedicine/types';
import { useDebounce } from '@telemedicine/hooks';
import {
  useListUsersQuery,
  useUpdateAdminPermissionsMutation,
  useUpdateUserStatusMutation,
  type AdminUser,
} from '../userApi';

const ROLE_OPTIONS: Array<{ value: UserRole | ''; label: string }> = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'health_officer', label: 'Health Officer' },
  { value: 'patient', label: 'Patient' },
];

const STATUS_OPTIONS: Array<{ value: 'pending' | 'active' | 'suspended' | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

export default function UserManagementPage() {
  const [page, setPage] = useState(0);
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<'pending' | 'active' | 'suspended' | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);

  const [permissionsUser, setPermissionsUser] = useState<AdminUser | null>(null);
  const [permissionsDraft, setPermissionsDraft] = useState<string[]>([]);

  const { data, isFetching } = useListUsersQuery({
    page: page + 1,
    limit: 10,
    role: role || undefined,
    status: status || undefined,
    search: search || undefined,
  });

  const [updateStatus] = useUpdateUserStatusMutation();
  const [updatePermissions, { isLoading: isSavingPermissions }] = useUpdateAdminPermissionsMutation();

  const openPermissionsDialog = (user: AdminUser) => {
    setPermissionsUser(user);
    setPermissionsDraft([]);
  };

  const savePermissions = async () => {
    if (!permissionsUser) return;
    await updatePermissions({ userId: permissionsUser.id, permissions: permissionsDraft }).unwrap();
    setPermissionsUser(null);
  };

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'role', header: 'Role', render: (row) => <Chip size="small" label={row.role.replace('_', ' ')} sx={{ textTransform: 'capitalize' }} /> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'verified', header: 'Email verified', render: (row) => (row.isEmailVerified ? 'Yes' : 'No') },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {row.status === 'suspended' ? (
            <Button size="small" variant="outlined" color="success" onClick={() => updateStatus({ userId: row.id, status: 'active' })}>
              Activate
            </Button>
          ) : (
            <Button size="small" variant="outlined" color="error" onClick={() => updateStatus({ userId: row.id, status: 'suspended' })}>
              Suspend
            </Button>
          )}
          {row.role === 'admin' && (
            <Button size="small" onClick={() => openPermissionsDialog(row)}>
              Permissions
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="User Management" subtitle="Every account on the platform, in one place" />
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            label="Search name or email"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            select
            label="Role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as UserRole | '');
              setPage(0);
            }}
          >
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            select
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as 'pending' | 'active' | 'suspended' | '');
              setPage(0);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        loading={isFetching}
        page={page}
        rowsPerPage={10}
        totalCount={data?.total ?? 0}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        emptyTitle="No users match these filters"
      />

      <Dialog open={!!permissionsUser} onClose={() => setPermissionsUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit permissions {permissionsUser ? `— ${permissionsUser.firstName} ${permissionsUser.lastName}` : ''}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={permissionsDraft}
            onChange={(_event, value) => setPermissionsDraft(value)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option} {...getTagProps({ index })} key={option} />)
            }
            renderInput={(params) => (
              <TextField {...params} label="Permission tags" placeholder="Type a tag and press Enter" sx={{ mt: 1 }} />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPermissionsUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={savePermissions} disabled={isSavingPermissions}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
