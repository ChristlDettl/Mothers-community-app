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
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("Auth error:", error.message);
        router.push("/login");
      } else {
        console.log("Session:", data.session);
        router.push("/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return <p>Authentifiziere dich...</p>;
}
