"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams?.get("code");

      if (!code) {
        console.error("No code in URL");
        router.replace("/login?error=no_code");
        return;
      }

      // Create Supabase client with proper cookie handling
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        // Exchange the code for a session (this handles PKCE verification)
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          setError(exchangeError.message);
          router.replace("/login?error=exchange_failed");
          return;
        }

        if (!data.session?.user?.email) {
          console.error("No session after exchange");
          router.replace("/login?error=no_session");
          return;
        }

        // Check if the email is authorized
        const email = data.session.user.email.toLowerCase();
        if (email !== "angel.lopez@vulkn-ai.com") {
          console.log("Unauthorized email:", email);
          await supabase.auth.signOut();
          router.replace("/login?error=acceso_denegado");
          return;
        }

        // Success - redirect to home
        console.log("Auth successful for:", email);
        router.replace("/");
      } catch (err) {
        console.error("Unexpected error in callback:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        router.replace("/login?error=unexpected");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-500 text-sm max-w-md text-center">
          <div className="mb-2">Error:</div>
          <div className="text-xs text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-gray-500 text-sm">Iniciando sesión...</div>
    </div>
  );
}
