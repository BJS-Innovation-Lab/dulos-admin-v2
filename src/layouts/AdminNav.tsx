"use client";

interface Tab {
  id: string;
  label: string;
  permissions: string[];
}

const TABS: Tab[] = [
  { id: "resumen", label: "Resumen", permissions: ["finance.read", "finance.stats.global"] },
  { id: "finanzas", label: "Finanzas", permissions: ["finance.read", "inventory.read", "access.stats"] },
  { id: "eventos", label: "Eventos", permissions: ["project.read", "project.manage", "event.read"] },
  { id: "operaciones", label: "Operaciones", permissions: ["ticket.scan", "marketing.codes.manage"] },
  { id: "admin", label: "Admin", permissions: ["team.manage", "sys.config", "sys.audit"] },
];

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  permissions: string[];
}

export default function AdminNav({ activeTab, onTabChange, permissions }: AdminNavProps) {
  const visibleTabs = TABS.filter(tab =>
    tab.permissions.some(p => permissions.includes(p))
  );

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide md:justify-center">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-[3px] ${
                activeTab === tab.id
                  ? "text-[#E63946] border-[#E63946]"
                  : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
