import { z } from 'zod';

export const userInviteSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido'),
  role: z.enum(['super_admin', 'operator', 'analyst', 'taquillero']),
});

export type UserInviteFormData = z.infer<typeof userInviteSchema>;
