import type { Metadata } from "next";
import "./globals.css";
import GTMScript from "../components/GTMScript";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Dulos Admin",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  description: "Panel de Administración - Dulos Entertainment",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#1E293B",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <GTMScript />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
