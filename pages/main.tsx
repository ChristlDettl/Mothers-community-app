// pages/main.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

export default function Main() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      }

      if (data) {
        setProfile(data);

        // Wenn Profil nicht vollständig, zurück zu Dashboard
        if (!data.full_name || !data.birthdate || !data.city) {
          router.push("/dashboard");
          return;
        }
      }

      setLoading(false);
    }

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <p>Lade Hauptseite...</p>;

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
        <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
          Hallo {profile?.full_name}!
        </h1>
        <p style={{ textAlign: "center", color: "#555" }}>
          Willkommen auf deiner Hauptseite. Hier kannst du Inhalte sehen oder dein Profil bearbeiten.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ padding: "12px 20px", marginRight: "15px", backgroundColor: "#4f46e5", color: "#fff", fontWeight: 600, borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            Profil bearbeiten
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: "12px 20px", backgroundColor: "#e53e3e", color: "#fff", fontWeight: 600, borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
          }




          
