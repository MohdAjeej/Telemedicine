import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, FormTextField, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { Doctor, User } from '@telemedicine/types';
import { useCreateDoctorMutation, useListDoctorsQuery } from '../doctorApi';
import { useListHospitalsQuery } from '../../hospital/hospitalApi';

interface CreateDoctorForm {
  email: string;
  firstName: string;
  lastName: string;
  hospitalId: string;
}

function doctorUser(doctor: Doctor): Partial<User> {
  return (doctor.userId as unknown as User) ?? {};
}

export default function DoctorListPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useListDoctorsQuery({ page: page + 1, limit: 10 });
  const { data: hospitals } = useListHospitalsQuery({ limit: 100 });
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<CreateDoctorForm>({
    defaultValues: { email: '', firstName: '', lastName: '', hospitalId: '' },
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
        subtitle="Manage doctor accounts and hospital assignments"
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
            <Controller
              name="hospitalId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Hospital" fullWidth>
                  {(hospitals?.items ?? []).map((hospital) => (
                    <MenuItem key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
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
