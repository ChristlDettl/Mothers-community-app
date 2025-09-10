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
      console.log("➡️ AuthCallback gestartet, URL:", window.location.href);

      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("❌ Auth error:", error);
        alert("Anmeldung fehlgeschlagen: " + error.message);
        router.push("/");
      } else {
        console.log("✅ Session erfolgreich:", data.session);
        console.log("👤 User:", data.user);

        alert("Anmeldung erfolgreich!");
        router.push("/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return <p>Authentifiziere dich...</p>;
}

