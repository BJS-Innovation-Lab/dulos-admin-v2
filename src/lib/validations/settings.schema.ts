import { z } from 'zod';

export const settingSchema = z.object({
  key: z.string().min(1, 'La clave es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
});

export type SettingFormData = z.infer<typeof settingSchema>;
