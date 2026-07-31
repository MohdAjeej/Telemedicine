import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, FormMultiSelect, FormTextField, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { Doctor, User } from '@telemedicine/types';
import { SPECIALTIES } from '@telemedicine/constants';
import { useCreateDoctorMutation, useListDoctorsQuery } from '../doctorApi';

interface CreateDoctorForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string[];
}

function doctorUser(doctor: Doctor): Partial<User> {
  return (doctor.userId as unknown as User) ?? {};
}

export default function DoctorListPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useListDoctorsQuery({ page: page + 1, limit: 10 });
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<CreateDoctorForm>({
    defaultValues: { email: '', password: '', firstName: '', lastName: '', specialization: [] },
  });

  const onSubmit = async (values: CreateDoctorForm) => {
    setFormError(null);
    try {
      await createDoctor({ ...values }).unwrap();
      reset();
      setOpen(false);
    } catch (error) {
      setFormError((error as { data?: { message?: string } })?.data?.message ?? 'Unable to add doctor');
    }
  };

  const columns: DataTableColumn<Doctor>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => `${doctorUser(row).firstName ?? ''} ${doctorUser(row).lastName ?? ''}`.trim() || '—',
    },
    { key: 'email', header: 'Email', render: (row) => doctorUser(row).email ?? '—' },
    { key: 'specialization', header: 'Specialization', render: (row) => row.specialization.join(', ') || '—' },
    { key: 'fee', header: 'Fee', render: (row) => `$${row.consultationFee}` },
  ];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Manage doctor accounts for your hospital"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add doctor
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
        emptyTitle="No doctors yet"
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add doctor</DialogTitle>
        <DialogContent>
          <Stack component="form" id="doctor-form" spacing={2} sx={{ mt: 1 }} onSubmit={handleSubmit(onSubmit)}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormTextField name="firstName" control={control} label="First name" />
            <FormTextField name="lastName" control={control} label="Last name" />
            <FormTextField name="email" control={control} label="Email" type="email" />
            <FormTextField name="password" control={control} label="Password" type="password" />
            <FormMultiSelect
              name="specialization"
              control={control}
              label="Specialization"
              options={SPECIALTIES}
              required
              helperText="Required for appointment booking"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="doctor-form" variant="contained" disabled={isLoading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
