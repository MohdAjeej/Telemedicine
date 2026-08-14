import { useState } from 'react';
import { useTheme, type Theme } from '@mui/material/styles';
import { Box, Grid, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { format } from 'date-fns';
import { DataTable, EmptyState, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { Vital } from '@telemedicine/types';
import { useListVitalsQuery } from '../vitalApi';

const MEASURES = [
  { key: 'bloodPressure', label: 'Blood pressure' },
  { key: 'heartRate', label: 'Heart rate', unit: 'bpm' },
  { key: 'temperature', label: 'Temperature', unit: '°F' },
  { key: 'spo2', label: 'SpO2', unit: '%' },
  { key: 'bmi', label: 'BMI' },
  { key: 'bloodSugar', label: 'Blood sugar', unit: 'mg/dL' },
  { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
] as const;

type MeasureKey = (typeof MEASURES)[number]['key'];

const ALL_KEY = 'all' as const;
const TABS = [{ key: ALL_KEY, label: 'All Tests' }, ...MEASURES] as const;
type TabKey = (typeof TABS)[number]['key'];

function measureValue(vital: Vital, key: MeasureKey): number | undefined {
  switch (key) {
    case 'heartRate':
      return vital.heartRate;
    case 'temperature':
      return vital.temperature;
    case 'spo2':
      return vital.oxygenSaturation;
    case 'bmi':
      return vital.bmi;
    case 'bloodSugar':
      return vital.bloodSugar;
    case 'hemoglobin':
      return vital.hemoglobin;
    case 'bloodPressure':
      return undefined;
  }
}

interface ChartPoint {
  date: string;
  fullDate: string;
  symptoms?: string;
}

interface AllTestsPoint extends ChartPoint {
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  bmi?: number;
  bloodSugar?: number;
  hemoglobin?: number;
}

interface AllTestsSeries {
  dataKey: keyof Omit<AllTestsPoint, 'date' | 'fullDate'>;
  name: string;
  color: (theme: Theme) => string;
  dash?: string;
}

const ALL_TESTS_SERIES: AllTestsSeries[] = [
  { dataKey: 'bpSystolic', name: 'Systolic (mmHg)', color: (t) => t.palette.primary.main },
  { dataKey: 'bpDiastolic', name: 'Diastolic (mmHg)', color: (t) => t.palette.secondary.main, dash: '6 3' },
  { dataKey: 'heartRate', name: 'Heart rate (bpm)', color: (t) => t.palette.success.main, dash: '2 2' },
  { dataKey: 'temperature', name: 'Temperature (°F)', color: (t) => t.palette.warning.main, dash: '8 4 2 4' },
  { dataKey: 'spo2', name: 'SpO2 (%)', color: (t) => t.palette.info.main, dash: '10 4' },
  { dataKey: 'bmi', name: 'BMI', color: (t) => t.palette.primary.dark, dash: '1 3' },
  { dataKey: 'bloodSugar', name: 'Blood sugar (mg/dL)', color: (t) => t.palette.secondary.dark, dash: '4 4 1 4' },
  { dataKey: 'hemoglobin', name: 'Hemoglobin (g/dL)', color: (t) => t.palette.text.secondary, dash: '12 3 3 3' },
];

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as ChartPoint | undefined;
  if (!row) return null;
  const dateLabel = format(new Date(row.fullDate), 'MMM d, yyyy p');

  return (
    <Paper variant="outlined" sx={{ p: 1.5, minWidth: 180, maxWidth: 260 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        {dateLabel}
      </Typography>
      <Stack spacing={0.5}>
        {payload.map((entry) => (
          <Stack key={entry.dataKey} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
            <Typography variant="body2">
              {entry.name}: <strong>{entry.value}</strong>
            </Typography>
          </Stack>
        ))}
      </Stack>
      {row.symptoms && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Symptoms
          </Typography>
          <Typography variant="body2">{row.symptoms}</Typography>
        </Box>
      )}
    </Paper>
  );
}

export default function VitalsPage() {
  const theme = useTheme();
  const { data: vitals = [], isFetching } = useListVitalsQuery({});
  const [selectedMeasure, setSelectedMeasure] = useState<TabKey>('heartRate');

  const measure = selectedMeasure === ALL_KEY ? undefined : MEASURES.find((item) => item.key === selectedMeasure)!;
  const sortedVitals = [...vitals].reverse();

  const bpData = sortedVitals
    .filter((vital) => vital.bloodPressureSystolic !== undefined || vital.bloodPressureDiastolic !== undefined)
    .map((vital) => ({
      date: format(new Date(vital.recordedAt), 'MMM d'),
      fullDate: vital.recordedAt,
      symptoms: vital.symptoms,
      systolic: vital.bloodPressureSystolic,
      diastolic: vital.bloodPressureDiastolic,
    }));

  const singleData =
    selectedMeasure === ALL_KEY
      ? []
      : sortedVitals
          .filter((vital) => measureValue(vital, selectedMeasure) !== undefined)
          .map((vital) => ({
            date: format(new Date(vital.recordedAt), 'MMM d'),
            fullDate: vital.recordedAt,
            symptoms: vital.symptoms,
            value: measureValue(vital, selectedMeasure),
          }));

  const allTestsData: AllTestsPoint[] = sortedVitals
    .filter((vital) =>
      [
        vital.bloodPressureSystolic,
        vital.bloodPressureDiastolic,
        vital.heartRate,
        vital.temperature,
        vital.oxygenSaturation,
        vital.bmi,
        vital.bloodSugar,
        vital.hemoglobin,
      ].some((v) => v !== undefined),
    )
    .map((vital) => ({
      date: format(new Date(vital.recordedAt), 'MMM d'),
      fullDate: vital.recordedAt,
      symptoms: vital.symptoms,
      bpSystolic: vital.bloodPressureSystolic,
      bpDiastolic: vital.bloodPressureDiastolic,
      heartRate: vital.heartRate,
      temperature: vital.temperature,
      spo2: vital.oxygenSaturation,
      bmi: vital.bmi,
      bloodSugar: vital.bloodSugar,
      hemoglobin: vital.hemoglobin,
    }));

  const chartData =
    selectedMeasure === ALL_KEY ? allTestsData : selectedMeasure === 'bloodPressure' ? bpData : singleData;

  const columns: DataTableColumn<Vital>[] = [
    { key: 'date', header: 'Date', render: (row) => format(new Date(row.recordedAt), 'MMM d, yyyy p') },
    { key: 'age', header: 'Age', render: (row) => row.age ?? '—' },
    { key: 'gender', header: 'Gender', render: (row) => row.gender ?? '—' },
    {
      key: 'bp',
      header: 'Blood pressure',
      render: (row) =>
        row.bloodPressureSystolic && row.bloodPressureDiastolic
          ? `${row.bloodPressureSystolic}/${row.bloodPressureDiastolic}`
          : '—',
    },
    { key: 'hr', header: 'Heart rate', render: (row) => row.heartRate ?? '—' },
    { key: 'temp', header: 'Temperature', render: (row) => row.temperature ?? '—' },
    { key: 'spo2', header: 'SpO2', render: (row) => row.oxygenSaturation ?? '—' },
    { key: 'bmi', header: 'BMI', render: (row) => row.bmi ?? '—' },
    { key: 'bloodSugar', header: 'Blood sugar', render: (row) => row.bloodSugar ?? '—' },
    { key: 'hemoglobin', header: 'Hemoglobin', render: (row) => row.hemoglobin ?? '—' },
    { key: 'comorbidity', header: 'Comorbidity', render: (row) => row.comorbidity ?? '—' },
    { key: 'complaints', header: 'Complaints', render: (row) => row.complaints ?? '—' },
    { key: 'symptoms', header: 'Symptoms', render: (row) => row.symptoms ?? '—' },
  ];

  return (
    <>
      <PageHeader title="Vitals" subtitle="Your recorded vitals and trends over time" />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {measure ? measure.label : 'All tests'} trend
            </Typography>
            <ToggleButtonGroup
              value={selectedMeasure}
              exclusive
              size="small"
              onChange={(_event, next: TabKey | null) => {
                if (next) setSelectedMeasure(next);
              }}
              sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: '1px solid', borderColor: 'divider', borderRadius: '16px !important' } }}
            >
              {TABS.map((item) => (
                <ToggleButton key={item.key} value={item.key} sx={{ px: 2, textTransform: 'none' }}>
                  {item.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {chartData.length > 0 ? (
              <>
                {chartData.length === 1 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Only one reading recorded so far — the trend line will build out as more vitals come in.
                  </Typography>
                )}
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      padding={chartData.length === 1 ? { left: 40, right: 40 } : undefined}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      domain={
                        chartData.length === 1
                          ? [(dataMin: number) => dataMin * 0.8, (dataMax: number) => dataMax * 1.2]
                          : undefined
                      }
                    />
                    <RechartsTooltip content={<ChartTooltip />} />
                    {(selectedMeasure === 'bloodPressure' || selectedMeasure === ALL_KEY) && <Legend />}
                    {selectedMeasure === ALL_KEY &&
                      ALL_TESTS_SERIES.map((series) => (
                        <Line
                          key={series.dataKey}
                          type="monotone"
                          dataKey={series.dataKey}
                          name={series.name}
                          stroke={series.color(theme)}
                          strokeDasharray={series.dash}
                          strokeWidth={2}
                          dot={{ r: allTestsData.length === 1 ? 6 : 3 }}
                          activeDot={{ r: 8 }}
                          isAnimationActive={false}
                        />
                      ))}
                    {selectedMeasure === 'bloodPressure' && (
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        name="Systolic (mmHg)"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={{ r: chartData.length === 1 ? 6 : 3 }}
                        activeDot={{ r: 8 }}
                        isAnimationActive={false}
                      />
                    )}
                    {selectedMeasure === 'bloodPressure' && (
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        name="Diastolic (mmHg)"
                        stroke={theme.palette.secondary.main}
                        strokeWidth={2}
                        dot={{ r: chartData.length === 1 ? 6 : 3 }}
                        activeDot={{ r: 8 }}
                        isAnimationActive={false}
                      />
                    )}
                    {measure && selectedMeasure !== 'bloodPressure' && (
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={'unit' in measure ? `${measure.label} (${measure.unit})` : measure.label}
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={{ r: chartData.length === 1 ? 6 : 3 }}
                        activeDot={{ r: 8 }}
                        isAnimationActive={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <EmptyState
                title="No data for this measure yet"
                description="Your care team will record vitals during visits."
              />
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
