// pages/main.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Main() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      console.log("🔄 Lade Session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session:", session);

      if (!session?.user) {
        console.log("❌ Kein User → redirect /login");
        router.push("/login");
        return;
      }

      setUser(session.user);

      console.log("📥 Lade Profil...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      console.log("Profil:", data, "Error:", error);

      if (error) {
        console.error("Fehler beim Laden des Profils:", error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log("❌ Kein Profil gefunden → redirect /dashboard");
        router.push("/dashboard");
        return;
      }

      setProfile(data);

      if (!data.full_name || !data.birthdate || !data.city) {
        console.log("⚠️ Profil unvollständig → redirect /dashboard");
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    }

    loadUser();
  }, [router]);

  // Loading-Schutz
  if (loading) return <p style={{ textAlign: "center" }}>Lade...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>Bitte einloggen...</p>;
  if (!profile) return <p style={{ textAlign: "center" }}>Profil wird geladen...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f7f8fa" }}>
      <NavBar />
      <div
        style={{
          maxWidth: "800px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          👋 Willkommen zurück, {profile.full_name || user.email}
        </h1>
        <p style={{ textAlign: "center", color: "#666" }}>
          Wohnort: {profile.city} · Anzahl Kinder: {profile.num_children}
        </p>
      </div>
    </div>
  );
}





          
