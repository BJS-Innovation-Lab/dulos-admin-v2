"use client";
import AdminHeader from "./AdminHeader";
import AdminNav from "./AdminNav";

interface AdminShellProps {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; permissions: string[] };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function AdminShell({ children, user, activeTab, onTabChange, onLogout }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f6f6]">
      <AdminHeader user={user} onLogout={onLogout} />
      <AdminNav activeTab={activeTab} onTabChange={onTabChange} permissions={user.permissions} />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
