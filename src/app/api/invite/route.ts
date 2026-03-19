import { NextRequest, NextResponse } from 'next/server';
import { inviteEmailHTML } from '@/lib/email-templates';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://udjwabtyhjcrpyuffavz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkandhYnR5aGpjcnB5dWZmYXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MzkzNCwiZXhwIjoyMDg5MTY5OTM0fQ.-1ABMJP5sYUyW1MDg2W7T8ZE3ipe5x_Lvmec9UdZkO8';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LOGIN_URL = 'https://dulos-admin-v2.vercel.app/login';

/**
 * POST /api/invite
 * Full invite flow: create team member → send beautiful email
 * 
 * Body: { email: string, name?: string, role: string }
 * 
 * If RESEND_API_KEY is set → sends via Resend (beautiful custom email)
 * Otherwise → falls back to Supabase Auth invite (basic template)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json();
    if (!email || !role) {
      return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 });
    }

    const displayName = name || email.split('@')[0];
    const headers = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    // Step 1: Check for existing member
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/team_members?email=eq.${encodeURIComponent(email)}&select=id`,
      { headers, cache: 'no-store' }
    );
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
    }

    // Step 2: Create team member
    const memberRes = await fetch(`${SUPABASE_URL}/rest/v1/team_members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: displayName,
        email,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
      }),
    });
    if (!memberRes.ok) {
      const errText = await memberRes.text();
      return NextResponse.json({ error: `Error creando miembro: ${errText}` }, { status: 500 });
    }
    const memberData = await memberRes.json();

    // Step 3: Send email
    let emailSent = false;
    let emailMethod = 'none';

    if (RESEND_API_KEY) {
      // Premium path: Resend with beautiful custom email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(RESEND_API_KEY);
        const html = inviteEmailHTML({ name: displayName, role, loginUrl: LOGIN_URL });

        const { error: resendError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Dulos <noreply@dulos.io>',
          to: email,
          subject: `🎫 Bienvenido a Dulos — Tu acceso como ${role === 'super_admin' ? 'Administrador' : role === 'operator' ? 'Operador' : role === 'analyst' ? 'Analista' : 'Taquillero'}`,
          html,
        });

        if (!resendError) {
          emailSent = true;
          emailMethod = 'resend';
        } else {
          console.error('Resend error:', resendError);
        }
      } catch (e) {
        console.error('Resend import/send error:', e);
      }
    }

    // Fallback: Supabase Auth invite
    if (!emailSent) {
      try {
        const inviteRes = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            data: { role, display_name: displayName },
          }),
        });
        if (inviteRes.ok) {
          emailSent = true;
          emailMethod = 'supabase';
        } else {
          console.warn('Supabase invite failed:', await inviteRes.text());
        }
      } catch (e) {
        console.warn('Supabase invite error:', e);
      }
    }

    // Step 4: Audit log
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          action: 'invite_user',
          entity_type: 'team_member',
          entity_id: memberData[0]?.id || '',
          user_email: 'system',
          details: JSON.stringify({ email, role, emailSent, emailMethod }),
          created_at: new Date().toISOString(),
        }),
      });
    } catch {
      // Audit is fire-and-forget
    }

    return NextResponse.json({
      success: true,
      member: memberData[0],
      emailSent,
      emailMethod,
      message: emailSent
        ? `Invitación enviada a ${email}`
        : `Usuario creado — puede acceder con Google en ${LOGIN_URL}`,
    });
  } catch (error) {
    console.error('Invite API error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
