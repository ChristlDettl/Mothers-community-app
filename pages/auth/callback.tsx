import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Versucht, Session aus URL-Fragment zu holen
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error) {
        console.error("Auth error:", error.message);
        router.push("/login");
      } else {
        // ✅ User ist eingeloggt → weiter zum Dashboard
        router.push("/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return <p>Authentifiziere dich...</p>;
}
