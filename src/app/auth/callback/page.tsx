"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Listen for the SIGNED_IN event which fires after Google OAuth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        subscription.unsubscribe();
        const email = session.user.email.toLowerCase();
        if (email !== "angel.lopez@vulkn-ai.com") {
          await supabase.auth.signOut();
          router.replace("/login?error=acceso_denegado");
        } else {
          router.replace("/");
        }
      }
    });

    // Also check immediately in case session already exists
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        subscription.unsubscribe();
        const email = session.user.email.toLowerCase();
        if (email !== "angel.lopez@vulkn-ai.com") {
          await supabase.auth.signOut();
          router.replace("/login?error=acceso_denegado");
        } else {
          router.replace("/");
        }
      }
    });

    // Timeout fallback — if nothing happens in 8s, redirect to login
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.replace("/login");
    }, 8000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-gray-500 text-sm">Iniciando sesión...</div>
    </div>
  );
}
