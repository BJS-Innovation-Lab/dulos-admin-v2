/**
 * Dulos Premium Email Templates
 * Branded, responsive HTML email templates for the invitation system
 */

const DULOS_RED = '#EF4444';
const DULOS_DARK = '#0a0a0a';
const DULOS_LOGO_URL = 'https://dulos-admin-v2.vercel.app/dulos-logo.svg';

export function inviteEmailHTML({
  name,
  role,
  loginUrl,
}: {
  name: string;
  role: string;
  loginUrl: string;
}) {
  const roleLabel: Record<string, string> = {
    super_admin: 'Administrador',
    operator: 'Operador',
    analyst: 'Analista',
    taquillero: 'Taquillero',
  };

  const displayRole = roleLabel[role] || role;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a Dulos</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header con gradiente oscuro -->
          <tr>
            <td style="background:linear-gradient(135deg, ${DULOS_DARK} 0%, #1a1a2e 100%);border-radius:16px 16px 0 0;padding:40px 40px 30px;text-align:center;">
              <img src="${DULOS_LOGO_URL}" alt="Dulos" width="160" style="display:inline-block;margin-bottom:16px;" />
              <p style="color:#ffffff80;font-size:13px;margin:0;letter-spacing:2px;text-transform:uppercase;">Panel de Administración</p>
            </td>
          </tr>
          
          <!-- Cuerpo principal -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <h1 style="color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">¡Hola ${name}!</h1>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Has sido invitado a formar parte del equipo de <strong style="color:#1a1a2e;">Dulos Entertainment</strong> como:
              </p>
              
              <!-- Badge de rol -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:${DULOS_RED};color:#ffffff;font-size:13px;font-weight:700;padding:8px 20px;border-radius:8px;letter-spacing:0.5px;">
                    ${displayRole}
                  </td>
                </tr>
              </table>
              
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Haz clic en el botón para acceder al panel. Podrás iniciar sesión con tu cuenta de Google autorizada.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, ${DULOS_RED} 0%, #dc2626 100%);color:#ffffff;font-size:16px;font-weight:700;padding:16px 48px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(239,68,68,0.4);">
                      Acceder a Dulos
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top:1px solid #e5e7eb;margin:32px 0 24px;"></div>
              
              <!-- Info boxes -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background-color:#fef2f2;border-radius:8px;border-left:4px solid ${DULOS_RED};">
                    <p style="color:#991b1b;font-size:12px;font-weight:600;margin:0 0 4px;">🔒 Seguridad</p>
                    <p style="color:#7f1d1d;font-size:12px;margin:0;line-height:1.5;">
                      Solo podrás acceder con la cuenta de Google asociada a este correo. Tu acceso está limitado a los permisos de tu rol.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#1a1a2e;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="color:#ffffff60;font-size:12px;margin:0 0 8px;">
                Dulos Entertainment © ${new Date().getFullYear()}
              </p>
              <p style="color:#ffffff40;font-size:11px;margin:0;">
                Este correo fue enviado automáticamente. No respondas a este mensaje.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Supabase invite template (uses GoTrue template variables)
 * Paste this in Supabase Dashboard → Authentication → Email Templates → Invite user
 */
export const SUPABASE_INVITE_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);border-radius:16px 16px 0 0;padding:40px 40px 30px;text-align:center;">
              <img src="https://dulos-admin-v2.vercel.app/dulos-logo.svg" alt="Dulos" width="160" style="display:inline-block;margin-bottom:16px;" />
              <p style="color:#ffffff80;font-size:13px;margin:0;letter-spacing:2px;text-transform:uppercase;">Panel de Administración</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <h1 style="color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">¡Bienvenido al equipo!</h1>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Has sido invitado a formar parte de <strong style="color:#1a1a2e;">Dulos Entertainment</strong>. Haz clic para activar tu cuenta:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #EF4444 0%, #dc2626 100%);color:#ffffff;font-size:16px;font-weight:700;padding:16px 48px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(239,68,68,0.4);">
                      Acceder a Dulos
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top:1px solid #e5e7eb;margin:32px 0 24px;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background-color:#fef2f2;border-radius:8px;border-left:4px solid #EF4444;">
                    <p style="color:#991b1b;font-size:12px;font-weight:600;margin:0 0 4px;">🔒 Seguridad</p>
                    <p style="color:#7f1d1d;font-size:12px;margin:0;line-height:1.5;">
                      Este enlace expira en 24 horas. Solo podrás acceder con la cuenta de Google autorizada.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1a1a2e;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="color:#ffffff60;font-size:12px;margin:0 0 8px;">Dulos Entertainment © 2026</p>
              <p style="color:#ffffff40;font-size:11px;margin:0;">Este correo fue enviado automáticamente.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
