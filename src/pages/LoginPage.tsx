"use client";
import { useState } from "react";
import Image from "next/image";

const DEMO_USERS = [
  { email: "admin@dulos.io", password: "admin123", name: "Administrador", role: "ADMIN",
    permissions: ["finance.read","finance.stats.global","event.read","event.write","event.create","project.read","project.manage","project.create","inventory.read","inventory.write","ticket.scan","ticket.checkin","marketing.codes.manage","marketing.codes.read","team.manage","team.read","sys.config","sys.audit","sys.org.manage","access.stats","order.view.list","order.view.pii","finance.export","finance.refund","data.export.pii"] },
  { email: "operador@dulos.io", password: "oper123", name: "Operador", role: "OPERADOR",
    permissions: ["finance.read","event.read","event.write","inventory.read","ticket.scan","marketing.codes.manage","project.read","project.manage","access.stats"] },
  { email: "productor@dulos.io", password: "prod123", name: "Productor", role: "PRODUCTOR",
    permissions: ["finance.read","event.read","project.read","inventory.read"] },
  { email: "taquillero@dulos.io", password: "taq123", name: "Taquillero", role: "TAQUILLERO",
    permissions: ["ticket.scan","ticket.checkin","inventory.read"] },
];

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="bg-[#111] rounded-2xl p-8 w-full max-w-md border border-white/10">
        <div className="flex justify-center mb-6">
          <Image src="/dulos-logo.svg" alt="Dulos" width={180} height={56} priority />
        </div>
        <h1 className="text-white text-xl font-semibold text-center">Panel de Administración</h1>
        <p className="text-gray-500 text-sm text-center mt-1 mb-8">Ingresa tus credenciales</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@dulos.io"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#E63946] focus:outline-none transition" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#E63946] focus:outline-none transition" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-[#E63946] hover:bg-[#c62d3a] text-white font-bold py-3 rounded-lg transition">
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-gray-600 text-xs text-center space-y-1">
          <p className="font-medium text-gray-500">Cuentas demo:</p>
          <p>admin@dulos.io / admin123</p>
          <p>operador@dulos.io / oper123</p>
          <p>productor@dulos.io / prod123</p>
          <p>taquillero@dulos.io / taq123</p>
        </div>
      </div>
    </div>
  );
}
