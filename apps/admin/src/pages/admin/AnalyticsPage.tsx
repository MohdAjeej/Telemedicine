import { useTheme, type Theme } from '@mui/material/styles';
import { Grid, Paper, Typography } from '@mui/material';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { EmptyState, PageHeader, StatCard, STATUS_COLOR_MAP } from '@telemedicine/ui';
import {
  useGetAppointmentsByStatusQuery,
  useGetAppointmentsOverTimeQuery,
  useGetDoctorUtilizationQuery,
  useGetPatientDemographicsQuery,
  useGetReportSummaryQuery,
} from '../../features/report/reportApi';

function statusFillColor(theme: Theme, status: string): string {
  const colorKey = STATUS_COLOR_MAP[status] ?? 'default';
  if (colorKey === 'default') return theme.palette.grey[500];
  return theme.palette[colorKey].main;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default function AnalyticsPage() {
  const theme = useTheme();

  const { data: summary } = useGetReportSummaryQuery();
  const { data: byStatus = [] } = useGetAppointmentsByStatusQuery();
  const { data: overTime = [] } = useGetAppointmentsOverTimeQuery({ days: 30 });
  const { data: utilization = [] } = useGetDoctorUtilizationQuery();
  const { data: demographics = [] } = useGetPatientDemographicsQuery();

  const overTimeData = overTime.map((point) => ({
    ...point,
    label: format(new Date(point.date), 'MMM d'),
  }));

  const utilizationData = utilization.map((row) => ({
    ...row,
    name: `Dr. ${row.firstName} ${row.lastName}`,
  }));

  const demographicsData = demographics.map((row) => ({
    ...row,
    label: row.gender.charAt(0).toUpperCase() + row.gender.slice(1),
  }));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Platform-wide trends and utilization" />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Doctors" value={summary?.totalDoctors ?? 0} icon={<MedicalServicesOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Patients"
            value={summary?.totalPatients ?? 0}
            icon={<LocalHospitalOutlinedIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Appointments"
            value={summary?.totalAppointments ?? 0}
            icon={<EventNoteOutlinedIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Appointments by status">
            {byStatus.length === 0 ? (
              <EmptyState title="No appointments yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byStatus} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="status"
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    width={90}
                    tickFormatter={(value: string) => value.replace('_', ' ')}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(value: number) => [value, 'Appointments']}
                    labelFormatter={(label: string) => label.replace('_', ' ')}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {byStatus.map((entry) => (
                      <Cell key={entry.status} fill={statusFillColor(theme, entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Appointments over the last 30 days">
            {overTimeData.length === 0 ? (
              <EmptyState title="No appointments in this window" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={overTimeData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    allowDecimals={false}
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={28}
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
                    dataKey="count"
                    name="Appointments"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Doctor utilization">
            {utilizationData.length === 0 ? (
              <EmptyState title="No appointment activity yet" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, utilizationData.length * 44)}>
                <BarChart data={utilizationData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} width={140} />
                  <RechartsTooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(value: number) => [value, 'Appointments']}
                  />
                  <Bar dataKey="appointmentCount" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Patients by gender">
            {demographicsData.length === 0 ? (
              <EmptyState title="No patient profiles yet" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={demographicsData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis type="category" dataKey="label" stroke={theme.palette.text.secondary} fontSize={12} width={90} />
                  <RechartsTooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(value: number) => [value, 'Patients']}
                  />
                  <Bar dataKey="count" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
