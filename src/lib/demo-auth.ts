export interface DemoUser {
  email: string;
  password: string;
  role: 'ADMIN' | 'OPERADOR' | 'PRODUCTOR' | 'TAQUILLERO';
  name: string;
  permissions: string[];
}

// All 47 permissions for ADMIN
const ALL_PERMISSIONS = [
  // Finance
  'finance.read',
  'finance.write',
  'finance.export',
  'finance.reports',
  'finance.refunds',
  'finance.payouts',
  'finance.invoices',
  'finance.taxes',
  // Events
  'event.read',
  'event.write',
  'event.delete',
  'event.publish',
  'event.archive',
  'event.duplicate',
  'event.analytics',
  'event.settings',
  // Inventory
  'inventory.read',
  'inventory.write',
  'inventory.delete',
  'inventory.adjust',
  'inventory.transfer',
  // Tickets
  'ticket.scan',
  'ticket.checkin',
  'ticket.void',
  'ticket.refund',
  'ticket.transfer',
  'ticket.upgrade',
  'ticket.reports',
  // Marketing
  'marketing.codes.read',
  'marketing.codes.manage',
  'marketing.campaigns.read',
  'marketing.campaigns.manage',
  'marketing.analytics',
  // Projects
  'project.read',
  'project.manage',
  'project.delete',
  'project.archive',
  // Access & Stats
  'access.stats',
  'access.logs',
  'access.reports',
  // Admin
  'admin.users.read',
  'admin.users.manage',
  'admin.roles.read',
  'admin.roles.manage',
  'admin.settings',
  'admin.billing',
  'admin.integrations',
];

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@dulos.io',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Administrador Demo',
    permissions: ALL_PERMISSIONS,
  },
  {
    email: 'operador@dulos.io',
    password: 'oper123',
    role: 'OPERADOR',
    name: 'Operador Demo',
    permissions: [
      'finance.read',
      'event.read',
      'event.write',
      'inventory.read',
      'ticket.scan',
      'marketing.codes.manage',
      'project.read',
      'project.manage',
      'access.stats',
    ],
  },
  {
    email: 'productor@dulos.io',
    password: 'prod123',
    role: 'PRODUCTOR',
    name: 'Productor Demo',
    permissions: [
      'finance.read',
      'event.read',
      'project.read',
      'inventory.read',
    ],
  },
  {
    email: 'taquillero@dulos.io',
    password: 'taq123',
    role: 'TAQUILLERO',
    name: 'Taquillero Demo',
    permissions: [
      'ticket.scan',
      'ticket.checkin',
      'inventory.read',
    ],
  },
];

export function authenticateDemo(email: string, password: string): DemoUser | null {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

export function getDemoPermissions(role: DemoUser['role']): string[] {
  const user = DEMO_USERS.find((u) => u.role === role);
  return user?.permissions || [];
}
