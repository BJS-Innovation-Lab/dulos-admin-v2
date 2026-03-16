import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dulos Admin",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  description: "Panel de Administración - Dulos Entertainment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
