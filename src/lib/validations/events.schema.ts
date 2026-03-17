import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  producer: z.string().min(1, 'El productor es requerido'),
  image_url: z.string().url('URL inválida').or(z.literal('')).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']),
});

export type EventFormData = z.infer<typeof eventSchema>;
