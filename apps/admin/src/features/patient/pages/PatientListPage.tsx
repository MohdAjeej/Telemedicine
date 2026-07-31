import { useState } from 'react';
import { DataTable, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { Patient, User } from '@telemedicine/types';
import { useListPatientsQuery } from '../patientApi';

function patientUser(patient: Patient): Partial<User> {
  return (patient.userId as unknown as User) ?? {};
}

export default function PatientListPage() {
  const [page, setPage] = useState(0);
  const { data, isFetching } = useListPatientsQuery({ page: page + 1, limit: 10 });

  const columns: DataTableColumn<Patient>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => `${patientUser(row).firstName ?? ''} ${patientUser(row).lastName ?? ''}`.trim() || '—',
    },
    { key: 'email', header: 'Email', render: (row) => patientUser(row).email ?? '—' },
    { key: 'gender', header: 'Gender', render: (row) => row.gender ?? '—' },
    { key: 'bloodGroup', header: 'Blood group', render: (row) => row.bloodGroup ?? '—' },
    { key: 'allergies', header: 'Allergies', render: (row) => row.allergies.join(', ') || '—' },
  ];

  return (
    <>
      <PageHeader title="Patients" subtitle="View patient records" />
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
        emptyTitle="No patients yet"
      />
    </>
  );
}
