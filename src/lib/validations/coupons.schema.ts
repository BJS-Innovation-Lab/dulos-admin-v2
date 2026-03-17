import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(1, 'El código es requerido').transform(v => v.toUpperCase()),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive('El valor debe ser mayor a 0'),
  event_id: z.string().optional(),
  max_uses: z.number().int().positive().optional(),
  valid_until: z.string().optional(),
});

export type CouponFormData = z.infer<typeof couponSchema>;
