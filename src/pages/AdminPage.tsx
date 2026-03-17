'use client';

import { useState, useEffect } from 'react';
import {
  fetchTeam,
  fetchAuditLogsByAction,
  TeamMember,
  AuditLog,
} from '../lib/supabase';

const ACCENT = '#E63946';

interface TeamDisplay {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimoAcceso: number;
}

interface LogDisplay {
  timestamp: string;
  usuario: string;
  accion: string;
}

interface RoleDefinition {
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  color: string;
}

interface Setting {
  key: string;
  value: string;
  description: string;
  group: 'general' | 'notifications' | 'operations';
}

const roleDefinitions: Record<string, RoleDefinition> = {
  'ADMIN': {
    name: 'Administrador',
    description: 'Acceso total al sistema',
    permissions: {
      'Pacientes/Eventos': ['Gestión completa de eventos', 'Acceso a todos los eventos', 'Gestión de pacientes'],
      'Finanzas': ['Gestión financiera completa', 'Reportes financieros', 'Auditoría financiera'],
      'Operaciones': ['Control de acceso', 'Gestión de cupones', 'Backup y recuperación'],
      'Admin': ['Gestión de usuarios', 'Configuración del sistema', 'Gestión de roles y permisos', 'Configuración de integraciones'],
    },
    color: 'bg-red-500'
  },
  'MANAGER': {
    name: 'Gerente',
    description: 'Gestión operativa y supervisión',
    permissions: {
      'Pacientes/Eventos': ['Gestión de eventos', 'Supervisión de ventas'],
      'Finanzas': ['Reportes financieros', 'Vista de ventas'],
      'Operaciones': ['Control de acceso a eventos', 'Gestión de cupones', 'Gestión de equipos'],
      'Admin': ['Vista de auditoría básica'],
    },
    color: 'bg-blue-500'
  },
  'TAQUILLERO': {
    name: 'Taquillero',
    description: 'Venta de boletos y atención al cliente',
    permissions: {
      'Pacientes/Eventos': ['Consulta de eventos', 'Atención al cliente básica'],
      'Finanzas': ['Consulta de órdenes'],
      'Operaciones': ['Venta de boletos', 'Aplicar cupones básicos', 'Check-in de boletos'],
      'Admin': [],
    },
    color: 'bg-green-500'
  }
};

// Flatten permissions for counting
const countPermissions = (perms: Record<string, string[]>) => Object.values(perms).reduce((sum, arr) => sum + arr.length, 0);

const defaultSettings: Setting[] = [
  { key: 'company_name', value: 'Dulos Entertainment', description: 'Nombre de la empresa', group: 'general' },
  { key: 'default_currency', value: 'MXN', description: 'Moneda por defecto', group: 'general' },
  { key: 'timezone', value: 'America/Mexico_City', description: 'Zona horaria', group: 'general' },
  { key: 'email_notifications', value: 'true', description: 'Notificaciones por email', group: 'notifications' },
  { key: 'auto_checkin_window', value: '2', description: 'Ventana de check-in automático (horas)', group: 'operations' },
];

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-1.5 px-2"><div className="h-3 bg-gray-200 rounded w-full"></div></td>
      ))}
    </tr>
  );
}

const formatRelativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<TeamDisplay[]>([]);
  const [logs, setLogs] = useState<LogDisplay[]>([]);
  const [settings, setSettings] = useState<Setting[]>(defaultSettings);
  const [logFilter, setLogFilter] = useState<string>('');
  const [showInvite, setShowInvite] = useState(false);
  const [showRoleManage, setShowRoleManage] = useState(false);
  const [showRoleDetail, setShowRoleDetail] = useState<string | null>(null);
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Auditoría collapsed state
  const [auditExpanded, setAuditExpanded] = useState(false);

  // Role management state
  const [rolePerms, setRolePerms] = useState<Record<string, Record<string, string[]>>>(() => {
    const initial: Record<string, Record<string, string[]>> = {};
    Object.entries(roleDefinitions).forEach(([key, role]) => {
      initial[key] = { ...role.permissions };
    });
    return initial;
  });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamData, auditData] = await Promise.all([
          fetchTeam().catch(() => []),
          fetchAuditLogsByAction(logFilter).catch(() => []),
        ]);

        setUsuarios(teamData.map((t) => ({
          id: t.id,
          nombre: t.name,
          email: t.email,
          rol: t.role,
          activo: t.is_active,
          ultimoAcceso: t.last_login ? new Date(t.last_login).getTime() : Date.now() - 30 * 24 * 60 * 60 * 1000,
        })));

        setLogs(auditData.map((l) => ({
          timestamp: new Date(l.created_at).toLocaleString('es-MX'),
          usuario: l.user_email,
          accion: `${l.action} ${l.entity_type}${l.entity_id ? ` (${l.entity_id})` : ''}`,
        })));

        // Load settings from localStorage
        const savedSettings = localStorage.getItem('dulos_admin_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading admin data:', error);
        setLoading(false);
      }
    }
    loadData();
  }, [logFilter]);

  const updateSetting = (key: string, value: string) => {
    const updatedSettings = settings.map(s =>
      s.key === key ? { ...s, value } : s
    );
    setSettings(updatedSettings);
    localStorage.setItem('dulos_admin_settings', JSON.stringify(updatedSettings));
    setEditingSettingKey(null);
  };

  const generalSettings = settings.filter(s => s.group === 'general');
  const notifSettings = settings.filter(s => s.group === 'notifications');
  const opsSettings = settings.filter(s => s.group === 'operations');

  // All possible permissions for the management modal
  const allPermissions: Record<string, string[]> = {
    'Pacientes/Eventos': ['Gestión completa de eventos', 'Acceso a todos los eventos', 'Gestión de pacientes', 'Consulta de eventos', 'Supervisión de ventas', 'Atención al cliente básica'],
    'Finanzas': ['Gestión financiera completa', 'Reportes financieros', 'Auditoría financiera', 'Vista de ventas', 'Consulta de órdenes'],
    'Operaciones': ['Control de acceso', 'Control de acceso a eventos', 'Gestión de cupones', 'Backup y recuperación', 'Venta de boletos', 'Aplicar cupones básicos', 'Check-in de boletos', 'Gestión de equipos'],
    'Admin': ['Gestión de usuarios', 'Configuración del sistema', 'Gestión de roles y permisos', 'Configuración de integraciones', 'Vista de auditoría básica'],
  };

  const togglePerm = (roleKey: string, category: string, perm: string) => {
    setRolePerms(prev => {
      const updated = { ...prev };
      const catPerms = [...(updated[roleKey][category] || [])];
      const idx = catPerms.indexOf(perm);
      if (idx >= 0) catPerms.splice(idx, 1);
      else catPerms.push(perm);
      updated[roleKey] = { ...updated[roleKey], [category]: catPerms };
      return updated;
    });
  };

  const showTeamOnboarding = usuarios.length < 3;

  return (
    <div className="bg-[#f8f6f6] p-4 max-w-7xl mx-auto">
      <h1 className="text-xl font-extrabold mb-4">Administración</h1>

      {/* Roles + Equipo row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Roles Section */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-extrabold text-base">Roles del Sistema</h2>
            <button onClick={() => setShowRoleManage(true)} className="px-3 py-1.5 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: ACCENT }}>Gestionar</button>
          </div>
          <div className="space-y-3">
            {Object.entries(roleDefinitions).map(([key, role]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setShowRoleDetail(key)}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${role.color}`}></span>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm">{role.name}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">{countPermissions(role.permissions)} permisos</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-extrabold text-base">Equipo</h2>
            <button onClick={() => setShowInvite(true)} className="px-3 py-1.5 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: ACCENT }}>+ Invitar</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b text-xs">
                <th className="pb-2 font-bold">Nombre</th><th className="pb-2 font-bold">Rol</th><th className="pb-2 font-bold">Acceso</th><th className="pb-2 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => <SkeletonRow key={i} cols={4} />)
              ) : usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-2">
                      <div className="font-bold text-sm leading-tight">{u.nombre}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[140px]">{u.email}</div>
                    </td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold text-white ${roleDefinitions[u.rol]?.color || 'bg-gray-500'}`}>
                        {roleDefinitions[u.rol]?.name || u.rol}
                      </span>
                    </td>
                    <td className="py-1.5 text-gray-400 text-xs">{formatRelativeTime(u.ultimoAcceso)}</td>
                    <td className="py-1.5"><span className={`inline-block w-2 h-2 rounded-full ${u.activo ? 'bg-green-500' : 'bg-gray-400'}`} /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-sm">No hay miembros</td></tr>
              )}
            </tbody>
          </table>

          {/* Team onboarding prompt */}
          {showTeamOnboarding && !loading && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-400 font-medium">Invita a tu equipo para colaborar</p>
              <p className="text-xs text-gray-300 mt-1">Los gerentes pueden supervisar eventos. Los taquilleros pueden escanear boletos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Auditoría — collapsed by default */}
      <div className="mb-4">
        {!auditExpanded ? (
          <div className="bg-white rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-extrabold text-base">Auditoría</h2>
              <span className="text-xs text-gray-400">{logs.length} acciones registradas</span>
            </div>
            <button
              onClick={() => setAuditExpanded(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Ver Auditoría
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-extrabold text-base">Auditoría</h2>
              <div className="flex gap-2">
                <select
                  value={logFilter}
                  onChange={e => setLogFilter(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded text-xs"
                >
                  <option value="">Todas las acciones</option>
                  <option value="login">Inicios de sesión</option>
                  <option value="create">Creaciones</option>
                  <option value="update">Actualizaciones</option>
                  <option value="delete">Eliminaciones</option>
                  <option value="notification">Notificaciones</option>
                </select>
                <button
                  onClick={() => setAuditExpanded(false)}
                  className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-50"
                >
                  Colapsar
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b text-xs">
                    <th className="pb-2 font-bold">Fecha</th><th className="pb-2 font-bold">Usuario</th><th className="pb-2 font-bold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map((i) => <SkeletonRow key={i} cols={3} />)
                  ) : logs.length > 0 ? (
                    logs.map((log, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1.5 text-gray-400 font-mono text-xs whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-1.5 text-xs truncate max-w-[120px] font-bold">{log.usuario}</td>
                        <td className="py-1.5 text-xs text-gray-600">{log.accion}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="py-4 text-center text-gray-400 text-sm">No hay registros</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Settings — grouped into cards with inline edit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* General */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-extrabold text-sm mb-3">General</h3>
          <div className="space-y-3">
            {generalSettings.map(s => (
              <div key={s.key}>
                <p className="text-xs text-gray-500">{s.description}</p>
                {editingSettingKey === s.key ? (
                  <div className="flex gap-1 mt-1">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') updateSetting(s.key, editingValue); if (e.key === 'Escape') setEditingSettingKey(null); }}
                    />
                    <button onClick={() => updateSetting(s.key, editingValue)} className="px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: ACCENT }}>OK</button>
                    <button onClick={() => setEditingSettingKey(null)} className="px-2 py-1 text-xs text-gray-500">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm font-bold">{s.value}</p>
                    <button
                      onClick={() => { setEditingSettingKey(s.key); setEditingValue(s.value); }}
                      className="text-xs text-[#E63946] hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-extrabold text-sm mb-3">Notificaciones</h3>
          <div className="space-y-3">
            {notifSettings.map(s => (
              <div key={s.key}>
                <p className="text-xs text-gray-500">{s.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => updateSetting(s.key, s.value === 'true' ? 'false' : 'true')}
                    className={`relative w-10 h-5 rounded-full transition-colors ${s.value === 'true' ? 'bg-[#E63946]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.value === 'true' ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-xs text-gray-400">{s.value === 'true' ? 'Activado' : 'Desactivado'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operaciones */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-extrabold text-sm mb-3">Operaciones</h3>
          <div className="space-y-3">
            {opsSettings.map(s => (
              <div key={s.key}>
                <p className="text-xs text-gray-500">{s.description}</p>
                {editingSettingKey === s.key ? (
                  <div className="flex gap-1 mt-1">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') updateSetting(s.key, editingValue); if (e.key === 'Escape') setEditingSettingKey(null); }}
                    />
                    <button onClick={() => updateSetting(s.key, editingValue)} className="px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: ACCENT }}>OK</button>
                    <button onClick={() => setEditingSettingKey(null)} className="px-2 py-1 text-xs text-gray-500">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm font-bold">{s.value}</p>
                    <button
                      onClick={() => { setEditingSettingKey(s.key); setEditingValue(s.value); }}
                      className="text-xs text-[#E63946] hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Detail Modal (click on a role card) */}
      {showRoleDetail && roleDefinitions[showRoleDetail] && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowRoleDetail(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-4 h-4 rounded-full ${roleDefinitions[showRoleDetail].color}`}></span>
              <h3 className="text-lg font-extrabold">{roleDefinitions[showRoleDetail].name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{roleDefinitions[showRoleDetail].description}</p>

            <h4 className="font-extrabold text-sm mb-2">Permisos:</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(roleDefinitions[showRoleDetail].permissions).map(([cat, perms]) =>
                perms.map((permission, index) => (
                  <div key={`${cat}-${index}`} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span>{permission}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowRoleDetail(null)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleManage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowRoleManage(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold mb-4">Gestionar Roles y Permisos</h3>

            <div className="space-y-6">
              {Object.entries(roleDefinitions).map(([roleKey, role]) => (
                <div key={roleKey} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-3 h-3 rounded-full ${role.color}`}></span>
                    <h4 className="font-extrabold text-sm">{role.name}</h4>
                    <span className="text-xs text-gray-400">{role.description}</span>
                  </div>

                  {Object.entries(allPermissions).map(([category, perms]) => {
                    const catKey = `${roleKey}-${category}`;
                    const isExpanded = expandedCategory === catKey;
                    const activeCount = (rolePerms[roleKey]?.[category] || []).length;

                    return (
                      <div key={category} className="mb-1">
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
                          className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded text-left"
                        >
                          <span className="text-xs font-bold text-gray-700">{category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">{activeCount}/{perms.length}</span>
                            <svg className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="pl-3 py-1 space-y-1">
                            {perms.map(perm => {
                              const checked = (rolePerms[roleKey]?.[category] || []).includes(perm);
                              return (
                                <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePerm(roleKey, category, perm)}
                                    className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                                  />
                                  <span className={checked ? 'text-gray-900' : 'text-gray-400'}>{perm}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowRoleManage(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowRoleManage(false); }}
                className="px-4 py-2 rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: ACCENT }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-base mb-3">Invitar usuario</h3>
            <input type="email" placeholder="Email" className="w-full border rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-[#E63946] focus:border-[#E63946]" />
            <select className="w-full border rounded-lg px-3 py-1.5 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-[#E63946] focus:border-[#E63946]">
              <option value="ADMIN">Administrador</option>
              <option value="MANAGER">Gerente</option>
              <option value="TAQUILLERO">Taquillero</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowInvite(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
              <button onClick={() => { alert('Invitación enviada'); setShowInvite(false); }} className="px-3 py-1.5 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: ACCENT }}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
