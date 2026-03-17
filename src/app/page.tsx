"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import SummaryPage from "@/pages/SummaryPage";
import FinancePage from "@/pages/FinancePage";
import EventsPage from "@/pages/EventsPage";
import OpsPage from "@/pages/OpsPage";
import AdminPage from "@/pages/AdminPage";
import AdminShell from "@/layouts/AdminShell";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["finance.read","finance.stats.global","event.read","event.write","project.read","project.manage","inventory.read","ticket.scan","marketing.codes.manage","team.manage","sys.config","sys.audit","access.stats"],
  OPERADOR: ["finance.read","event.read","event.write","inventory.read","ticket.scan","marketing.codes.manage","project.read","project.manage","access.stats"],
  PRODUCTOR: ["finance.read","event.read","project.read","inventory.read"],
  TAQUILLERO: ["ticket.scan","ticket.checkin","inventory.read"],
  SOPORTE: ["event.read","ticket.read","order.view.list"],
};

async function validateTeamMember(email: string): Promise<{ valid: boolean; user: any; error?: string }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/dulos_team?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    );
    const team = await res.json();

    if (!team || team.length === 0) {
      return { valid: false, user: null, error: "No tienes acceso al sistema. Contacta al administrador." };
    }

    const member = team[0];

    if (!member.is_active) {
      return { valid: false, user: null, error: "Tu cuenta ha sido desactivada." };
    }

    return {
      valid: true,
      user: {
        email: member.email,
        name: member.name,
        role: member.role,
        permissions: ROLE_PERMISSIONS[member.role] || [],
      },
    };
  } catch {
    return { valid: false, user: null, error: "Error de conexión. Intenta de nuevo." };
  }
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("resumen");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Middleware already verified auth — just get the session
      const { data: { session } } = await getSupabase().auth.getSession();

      if (!session?.user?.email) {
        if (mounted) router.push("/login");
        return;
      }

      const email = session.user.email.toLowerCase();
      // Set user from session directly — middleware already validated dulos_team
      const userObj = {
        email,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split("@")[0],
        role: "ADMIN",
        permissions: ROLE_PERMISSIONS["ADMIN"] || [],
      };

      if (mounted) { setUser(userObj); setLoading(false); }
    };

    init();
    return () => { mounted = false; };
  }, [router]);

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    localStorage.removeItem("dulos_user");
    localStorage.removeItem("dulos_sec_v");
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        {/* Background image with Ken Burns effect */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/splash-bg.jpg)',
            animation: 'kenBurns 12s ease-in-out infinite alternate',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Dulos logo pulse */}
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center" style={{ animation: 'logoPulse 2s ease-in-out infinite' }}>
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 C25 10, 10 30, 10 50 C10 70, 25 90, 50 90 C75 90, 90 70, 90 50 C90 30, 75 10, 50 10 Z M50 25 C65 25, 75 37, 75 50 C75 63, 65 75, 50 75 C35 75, 25 63, 25 50 C25 37, 35 25, 50 25 Z" fill="#EF4444" />
            </svg>
          </div>

          {/* Brand text */}
          <div className="text-center">
            <h1 className="text-white text-2xl font-black tracking-wider" style={{ animation: 'fadeInUp 0.8s ease-out' }}>DULOS</h1>
            <p className="text-white/60 text-sm mt-1 font-medium" style={{ animation: 'fadeInUp 1s ease-out' }}>Plataforma de Entretenimiento</p>
          </div>

          {/* Loading bar */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#EF4444] rounded-full" style={{ animation: 'loadingBar 1.5s ease-in-out infinite', backgroundSize: '200% 100%' }} />
          </div>

          <p className="text-white/40 text-xs font-medium tracking-wide" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
            {!user ? 'Redirigiendo...' : 'Cargando experiencia...'}
          </p>
        </div>

        <style>{`
          @keyframes kenBurns {
            0% { transform: scale(1) translateY(0); }
            100% { transform: scale(1.1) translateY(-2%); }
          }
          @keyframes logoPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes loadingBar {
            0% { width: 0%; background-position: 0% 0; }
            50% { width: 70%; background-position: 100% 0; }
            100% { width: 100%; background-position: 0% 0; }
          }
        `}</style>
      </div>
    );
  }

  const pages: Record<string, React.ReactNode> = {
    resumen: <SummaryPage />,
    finanzas: <FinancePage />,
    eventos: <EventsPage />,
    operaciones: <OpsPage />,
    admin: <AdminPage />,
  };

  return (
    <AdminShell user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {pages[activeTab] || <SummaryPage />}
    </AdminShell>
  );
}
