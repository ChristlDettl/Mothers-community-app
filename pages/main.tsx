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
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f9fafb", // leichtes Grau, sehr clean
      }}
    >
      <NavBar />

      <div
        style={{
          maxWidth: "650px",
          margin: "60px auto",
          padding: "35px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)", // sanfter Schatten
          textAlign: "center",
        }}
      >
        <h1
          style={{
            marginBottom: "20px",
            color: "#6d28d9", // Pastellviolett
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          Hallo {profile?.full_name || user?.email} 👋
        </h1>

        <p
          style={{
            marginBottom: "30px",
            color: "#374151",
            fontSize: "1rem",
          }}
        >
          Willkommen in deiner Community-Hauptseite!
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => router.push("/dashboard?edit=1")}
            style={{
              padding: "12px 22px",
              backgroundColor: "#ede9fe", // zartes Pastellviolett
              color: "#4c1d95", // dunkler Violettton
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              width: "100%",
              maxWidth: "280px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
          >
            Profil bearbeiten
          </button>

          <button
            onClick={() => router.push("/profiles")}
            style={{
              padding: "12px 22px",
              backgroundColor: "#fecaca", // Pastellrosa
              color: "#7f1d1d", // dunkler Rotbraun
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              width: "100%",
              maxWidth: "280px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fca5a5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fecaca")}
          >
            Alle Mütter anzeigen
          </button>
        </div>
      </div>
    </div>
  );
}

