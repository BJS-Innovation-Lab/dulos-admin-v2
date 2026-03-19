/**
 * Send emails via Gmail API — ZERO external dependencies, ZERO Node.js imports
 * Uses Web Crypto API (works everywhere: Node, Edge, Vercel, browser)
 * No webpack bundling issues — safe to import from server actions
 */

import { inviteEmailHTML } from './email-templates';

const IMPERSONATE_EMAIL = 'vulkimi.testeo@vulkn-ai.com';
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SA_EMAIL = 'vulkn-agents@hq-vulkn.iam.gserviceaccount.com';

const SA_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCjC+UnFlYNjtvJ
0odwGjxOKP0gKxA+NrgShtDmAJDf4R8BVidcKBA5MqnBHJcOVF4dDrjECccRYGza
7l0u5bV2z9+OXU5j53esirNwzj9jUCoMnvfLiLsQ29iZ0Edsnj7HPQhNFQ8q55m2
86sKQtTCVfYLsZb96687WdR3AD77LWUAzT2hCBpj2wTmzIzt8CDrhtisvfk2xdJC
dpkUdIHLXEzYc80gC5MEEsptE3PSrJq00dmkn6iSrcTmlNpzAzbc1Grz0NZBDIgL
5gKSHiY1t/I/VbbeODOZnCsNjf9CvoFxkHJO9dvV3OnKyQarwwVHxZc7cqf3QZKh
wd8wfwKPAgMBAAECggEAN/OrDcDSgxCVSCshI009iKz0QIfGqTLp9CGjqmpjTRDa
LQE9vJhbCOXj70s6Y0Z8jYgxy8R3NfVbJb5K5/8YSM+JLjfC4PHb1bA7Z+i/Q/uM
kowzCPvBBkYLjK029YVQkdrV8G3bqKOV0nzII1tP2+jX6Kdm43hvx/RJvxSsiFE9
bRE8Q7GS3+M7qhFclWEON/5wczNLnAAeDde/CoIc5sv7hkumFXxjSyDV+LxevPkj
mTk0lqLvJ9dFceDGqDP/oDxv28o9jCwukjlUIAfA65eWZgJo1MQIHKf8/Pb1vFWm
GVMAE6gdFxfhyDmoQ3v8VvdQtE2ORh9FYAiaEY9oUQKBgQDPdh2D+py+fkGvx45G
GqEr4+hcslaEpJ5+OdbmjuBDJ2CbTQmTCRY2DaZ5Va+q1JBojfVyQz4YUwdK+9ju
Aod5YzC39X1Zr4Vl8gtgYGtl6fkW+ASETCt0lF5MkLr299GR3Xk8TbELUlPOVPp6
r4Pay49KWlXKdk77P8XISAzHpQKBgQDJMY0hBLd1SWcGhSdMdn8zwpA0hVK6uE/f
kKDTWNTWboTxsfGiAIdlZDKds+ZgATr9yWA98tv0P9mvMsMciDhyXle6o+CBNT0o
uJ98AClZeIUTz3JbiQwqwzhXUSM6VvPrg952g/ENFFwW7bhSa7RjbyAy1vqkUes+
Zk96nqsrIwKBgQCJqFhBYKNtCx3O410WS0kydFGUYIlkDk9UdlCQP7GzHYfOxLlb
pSXly/zwedjMQ6tmlPuOS+wB++XU7XOtymPWOejzx6LbRcoAMTE3TAM3Zp7vjLaC
ioAzJNfFeit1AE9AuHJffzXAy2nseRqTGa8mGPgFYBeY9hPGRzSXhqdkOQKBgCL1
DBtvkVy8mz0Dx7c+Y42fwaSOgbhVq/MhUwBFz/1OCKViEKTgSKYySaUjC+UkcZaE
9cbtuo/uxCjvvfzoIj6k68NPFAP/NxgrM/K8qHKWQTEW+zyyTD3l25U4UNGjKBCE
whN/i1OFdRa6ySrw8c/REBwlRDlmzmPyLN8WUJFXAoGBAJSbgi4GwrFuidyzDmw6
UorBUDW+OlShosy/PMOJfTIo/x7tMycKmfUKamCrhQUkv6avQQQV0Pjjj48XEkNW
5ISD2ydtgQ+4n2LYkUhlMq+jSitEU1Rp9P+3FyRDlU2+pash+vAHKdpDUhurYpPG
Wh3OlzfCeYIUiBg7uoGEJIba
-----END PRIVATE KEY-----`;

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Administrador',
  operator: 'Operador',
  analyst: 'Analista',
  taquillero: 'Taquillero',
};

// ---- Web Crypto helpers (no Node.js crypto import) ----

function arrayBufferToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToBase64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

async function signJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = strToBase64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = strToBase64url(JSON.stringify({
    iss: SA_EMAIL,
    sub: IMPERSONATE_EMAIL,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));

  const signInput = `${header}.${payload}`;

  const keyData = pemToArrayBuffer(SA_PRIVATE_KEY_PEM);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signInput)
  );

  const signature = arrayBufferToBase64url(signatureBuffer);
  return `${signInput}.${signature}`;
}

async function getAccessToken(): Promise<string> {
  const jwt = await signJWT();

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ---- Public API ----

export async function sendInviteEmail({
  to,
  name,
  role,
}: {
  to: string;
  name: string;
  role: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();
    const displayRole = ROLE_LABELS[role] || role;
    const html = inviteEmailHTML({
      name,
      role,
      loginUrl: 'https://dulos-admin-v2.vercel.app/login',
    });

    const subject = `🎫 Bienvenido a Dulos — Tu acceso como ${displayRole}`;
    const boundary = 'dulos_boundary_' + Date.now();

    const mimeMessage = [
      `From: "Dulos Entertainment" <${IMPERSONATE_EMAIL}>`,
      `To: ${name} <${to}>`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      `¡Hola ${name}! Has sido invitado al equipo de Dulos Entertainment como ${displayRole}. Accede aquí: https://dulos-admin-v2.vercel.app/login`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      btoa(unescape(encodeURIComponent(html))).replace(/(.{76})/g, '$1\n'),
      '',
      `--${boundary}--`,
    ].join('\r\n');

    const encodedMessage = btoa(unescape(encodeURIComponent(mimeMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gmail send failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('sendInviteEmail error:', msg);
    return { success: false, error: msg };
  }
}
