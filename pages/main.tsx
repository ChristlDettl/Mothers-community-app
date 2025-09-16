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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Profils:", error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    loadUser();
  }, [router]);

  if (loading) return <p style={{ textAlign: "center" }}>Lade...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f7f8fa" }}>
      <NavBar />

      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
          Hallo {profile?.full_name || user?.email} 👋
        </h1>

        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Willkommen in deiner Community-Hauptseite!
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <button
            onClick={() => router.push("/dashboard?edit=1")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Profil bearbeiten
          </button>
          {/* Neue: Alle Mütter anzeigen */}
          <button
            onClick={() => router.push("/profiles")}
            style={{
              marginTop: "15px",
              padding: "12px 20px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            Alle Mütter anzeigen
          </button>
        </div>
      </div>
    </div>
  );
}



  
