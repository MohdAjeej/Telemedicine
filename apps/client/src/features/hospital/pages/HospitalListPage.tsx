import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Controller } from 'react-hook-form';
import { DataTable, FormTextField, PageHeader, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import { hospitalSchema, type HospitalInput } from '@telemedicine/validation';
import type { Hospital } from '@telemedicine/types';
import { useCreateHospitalMutation, useListHospitalsQuery } from '../hospitalApi';

export default function HospitalListPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useListHospitalsQuery({ page: page + 1, limit: 10 });
  const [createHospital, { isLoading }] = useCreateHospitalMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<HospitalInput>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      registrationNumber: '',
      type: 'hospital',
      phone: '',
      email: '',
      website: '',
      city: '',
      country: '',
    },
  });

  const onSubmit = async (values: HospitalInput) => {
    setFormError(null);
    try {
      await createHospital(values).unwrap();
      reset();
      setOpen(false);
    } catch (error) {
      setFormError((error as { data?: { message?: string } })?.data?.message ?? 'Unable to create hospital');
    }
  };

  const columns: DataTableColumn<Hospital>[] = [
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'type', header: 'Type', render: (row) => row.type.replace('_', ' ') },
    { key: 'phone', header: 'Phone', render: (row) => row.contact.phone },
    { key: 'email', header: 'Email', render: (row) => row.contact.email },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Hospitals"
        subtitle="Manage hospitals and clinics on the platform"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add hospital
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
        emptyTitle="No hospitals yet"
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add hospital</DialogTitle>
        <DialogContent>
          <Stack component="form" id="hospital-form" spacing={2} sx={{ mt: 1 }} onSubmit={handleSubmit(onSubmit)}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormTextField name="name" control={control} label="Name" />
            <FormTextField name="registrationNumber" control={control} label="Registration number" />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Type" fullWidth>
                  <MenuItem value="clinic">Clinic</MenuItem>
                  <MenuItem value="hospital">Hospital</MenuItem>
                  <MenuItem value="multi_specialty">Multi-specialty</MenuItem>
                </TextField>
              )}
            />
            <FormTextField name="phone" control={control} label="Phone" />
            <FormTextField name="email" control={control} label="Email" type="email" />
            <FormTextField name="website" control={control} label="Website (optional)" />
            <FormTextField name="city" control={control} label="City" />
            <FormTextField name="country" control={control} label="Country" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="hospital-form" variant="contained" disabled={isLoading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
