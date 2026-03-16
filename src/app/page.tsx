"use client";
import { useEffect, useState } from "react";
import LoginPage from "@/pages/LoginPage";
import SummaryPage from "@/pages/SummaryPage";
import FinancePage from "@/pages/FinancePage";
import EventsPage from "@/pages/EventsPage";
import OpsPage from "@/pages/OpsPage";
import AdminPage from "@/pages/AdminPage";
import AdminShell from "@/layouts/AdminShell";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("resumen");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dulos_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={(u: any) => {
          localStorage.setItem("dulos_user", JSON.stringify(u));
          setUser(u);
        }}
      />
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("dulos_user");
    setUser(null);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "resumen": return <SummaryPage />;
      case "finanzas": return <FinancePage />;
      case "eventos": return <EventsPage />;
      case "operaciones": return <OpsPage />;
      case "admin": return <AdminPage />;
      default: return <SummaryPage />;
    }
  };

  return (
    <AdminShell user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {renderPage()}
    </AdminShell>
  );
}
