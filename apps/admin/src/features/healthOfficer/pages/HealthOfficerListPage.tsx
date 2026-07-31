import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, FormTextField, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { HealthOfficer, User } from '@telemedicine/types';
import { useCreateHealthOfficerMutation, useListHealthOfficersQuery } from '../healthOfficerApi';

interface CreateHealthOfficerForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

function officerUser(officer: HealthOfficer): Partial<User> {
  return (officer.userId as unknown as User) ?? {};
}

export default function HealthOfficerListPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useListHealthOfficersQuery({ page: page + 1, limit: 10 });
  const [createHealthOfficer, { isLoading }] = useCreateHealthOfficerMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<CreateHealthOfficerForm>({
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
  });

  const onSubmit = async (values: CreateHealthOfficerForm) => {
    setFormError(null);
    try {
      await createHealthOfficer({ ...values }).unwrap();
      reset();
      setOpen(false);
    } catch (error) {
      setFormError(
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to add health officer',
      );
    }
  };

  const columns: DataTableColumn<HealthOfficer>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => `${officerUser(row).firstName ?? ''} ${officerUser(row).lastName ?? ''}`.trim() || '—',
    },
    { key: 'email', header: 'Email', render: (row) => officerUser(row).email ?? '—' },
    { key: 'clinic', header: 'Assigned clinic', render: (row) => row.assignedClinic ?? '—' },
    { key: 'employeeId', header: 'Employee ID', render: (row) => row.employeeId ?? '—' },
  ];

  return (
    <>
      <PageHeader
        title="Health Officers"
        subtitle="Manage front-desk and clinic health officer accounts for your hospital"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add health officer
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row._id}
        loading={isFetching}
        page={page}
        rowsPerPage={10}
        totalCount={data?.total ?? 0}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        emptyTitle="No health officers yet"
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add health officer</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="ho-form"
            spacing={2}
            sx={{ mt: 1 }}
            onSubmit={handleSubmit(onSubmit)}
          >
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormTextField name="firstName" control={control} label="First name" />
            <FormTextField name="lastName" control={control} label="Last name" />
            <FormTextField name="email" control={control} label="Email" type="email" />
            <FormTextField name="password" control={control} label="Password" type="password" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="ho-form" variant="contained" disabled={isLoading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
