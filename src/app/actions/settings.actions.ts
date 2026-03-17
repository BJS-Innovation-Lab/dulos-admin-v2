'use server';

import { settingSchema } from '@/lib/validations/settings.schema';
import { logAction } from './audit.actions';

export async function getSettings() {
  // Settings are stored in localStorage on the client side for now.
  // This action provides a server-side compatible interface.
  return {
    success: true,
    data: [
      { key: 'company_name', value: 'Dulos Entertainment', description: 'Nombre de la empresa', group: 'general' },
      { key: 'default_currency', value: 'MXN', description: 'Moneda por defecto', group: 'general' },
      { key: 'timezone', value: 'America/Mexico_City', description: 'Zona horaria', group: 'general' },
      { key: 'email_notifications', value: 'true', description: 'Notificaciones por email', group: 'notifications' },
      { key: 'auto_checkin_window', value: '2', description: 'Ventana de check-in automático (horas)', group: 'operations' },
    ],
  };
}

export async function updateSetting(key: string, value: string) {
  const parsed = settingSchema.safeParse({ key, value });
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  try {
    // Fire-and-forget audit log
    logAction('update', 'setting', key, JSON.stringify({ value }));
    return { success: true, data: { key, value } };
  } catch (error) {
    return { success: false, error: 'Error al guardar configuración' };
  }
}
