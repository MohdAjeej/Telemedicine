import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, Button, FormControlLabel, Snackbar, Stack, Switch } from '@mui/material';
import { FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../settingsApi';

interface SettingsForm {
  platformName: string;
  supportEmail: string;
  defaultAppointmentSlotMinutes: number;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset } = useForm<SettingsForm>({
    defaultValues: {
      platformName: '',
      supportEmail: '',
      defaultAppointmentSlotMinutes: 30,
      maintenanceMode: false,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        platformName: data.platformName,
        supportEmail: data.supportEmail,
        defaultAppointmentSlotMinutes: data.defaultAppointmentSlotMinutes,
        maintenanceMode: data.maintenanceMode,
      });
    }
  }, [data, reset]);

  if (isLoading) return <LoadingSpinner label="Loading settings..." />;

  const onSubmit = async (values: SettingsForm) => {
    await updateSettings(values).unwrap();
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="System Settings" subtitle="Platform-wide configuration" />
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
        <FormTextField name="platformName" control={control} label="Platform name" />
        <FormTextField name="supportEmail" control={control} label="Support email" type="email" />
        <FormTextField
          name="defaultAppointmentSlotMinutes"
          control={control}
          label="Default appointment slot (minutes)"
          type="number"
        />
        <Controller
          name="maintenanceMode"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
              label="Maintenance mode"
            />
          )}
        />
        <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
          Save changes
        </Button>
      </Stack>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Settings updated
        </Alert>
      </Snackbar>
    </>
  );
}
