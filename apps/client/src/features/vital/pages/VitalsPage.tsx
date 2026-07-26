import { useTheme } from '@mui/material/styles';
import { Grid, Paper, Typography } from '@mui/material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { DataTable, EmptyState, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { Vital } from '@telemedicine/types';
import { useListVitalsQuery } from '../vitalApi';

export default function VitalsPage() {
  const theme = useTheme();
  const { data: vitals = [], isFetching } = useListVitalsQuery();

  const chartData = [...vitals]
    .reverse()
    .filter((vital) => vital.heartRate !== undefined)
    .map((vital) => ({
      date: format(new Date(vital.recordedAt), 'MMM d'),
      heartRate: vital.heartRate,
    }));

  const columns: DataTableColumn<Vital>[] = [
    { key: 'date', header: 'Date', render: (row) => format(new Date(row.recordedAt), 'MMM d, yyyy p') },
    {
      key: 'bp',
      header: 'Blood pressure',
      render: (row) =>
        row.bloodPressure ? `${row.bloodPressure.systolic}/${row.bloodPressure.diastolic}` : '—',
    },
    { key: 'hr', header: 'Heart rate', render: (row) => row.heartRate ?? '—' },
    { key: 'temp', header: 'Temperature', render: (row) => row.temperature ?? '—' },
    { key: 'spo2', header: 'SpO2', render: (row) => row.oxygenSaturation ?? '—' },
    { key: 'bmi', header: 'BMI', render: (row) => row.bmi ?? '—' },
  ];

  return (
    <>
      <PageHeader title="Vitals" subtitle="Your recorded vitals and trends over time" />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Heart rate trend
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart rate (bpm)"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No vitals recorded yet" description="Your care team will record vitals during visits." />
            )}
          </Paper>
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        rows={vitals}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="No vitals recorded yet"
      />
    </>
  );
}
