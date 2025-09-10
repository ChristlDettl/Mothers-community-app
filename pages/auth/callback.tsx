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
    const checkSession = async () => {
      console.log("➡️ Callback aufgerufen. Prüfe Session...");

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Fehler beim Laden der Session:", error);
        alert("Anmeldung fehlgeschlagen: " + error.message);
        router.push("/");
      } else if (data.session) {
        console.log("✅ Session gefunden:", data.session);
        alert("Anmeldung erfolgreich!");
        router.push("/dashboard");
      } else {
        console.warn("⚠️ Keine Session gefunden.");
        alert("Keine aktive Session gefunden, bitte erneut einloggen.");
        router.push("/");
      }
    };

    checkSession();
  }, [router]);

  return <p>Authentifiziere dich...</p>;
}

