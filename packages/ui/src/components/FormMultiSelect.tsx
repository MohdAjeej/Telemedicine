import { Autocomplete, TextField } from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

export interface FormMultiSelectProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: readonly string[];
  required?: boolean;
  helperText?: string;
}

/** Multi-select with removable chips (each has a delete/×) via MUI Autocomplete, backed by react-hook-form. */
export function FormMultiSelect<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  required,
  helperText,
}: FormMultiSelectProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={
        required
          ? {
              validate: (value) =>
                (Array.isArray(value) && value.length > 0) || `Select at least one ${label.toLowerCase()}`,
            }
          : undefined
      }
      render={({ field: { onChange, value, ref, ...field }, fieldState }) => (
        <Autocomplete
          multiple
          options={options as string[]}
          value={(value as string[]) ?? []}
          onChange={(_event, newValue) => onChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              {...field}
              inputRef={ref}
              label={label}
              required={required}
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? helperText}
            />
          )}
        />
      )}
    />
  );
}
