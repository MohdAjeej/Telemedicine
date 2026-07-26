import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

export interface FormTextFieldProps<TFieldValues extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'defaultValue'> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
}

export function FormTextField<TFieldValues extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: FormTextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
          value={field.value ?? ''}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? textFieldProps.helperText}
          fullWidth
        />
      )}
    />
  );
}
