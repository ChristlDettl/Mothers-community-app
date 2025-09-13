// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const isProfileComplete = (profile: any) => {
  return profile.full_name && profile.birthdate && profile.city;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
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
        setProfile({
          id: session.user.id,
          email: session.user.email,
          full_name: "",
          birthdate: "",
          city: "",
          num_children: 0,
          children_ages: [],
        });
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);

      // Falls Profil schon komplett ist → direkt zur Hauptseite
      if (data && isProfileComplete(data)) {
        console.log("✅ Profil vollständig → redirect /main");
        router.push("/main");
      }
    }

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Profil gespeichert!");
      if (isProfileComplete(profile)) {
        router.push("/main");
      }
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Lade...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>Bitte einloggen...</p>;
  if (!profile) return <p style={{ textAlign: "center" }}>Profil wird vorbereitet...</p>;

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
          Willkommen, {profile?.full_name || user.email}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Name:</label>
            <input
              type="text"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          {/* Geburtsdatum */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Geburtsdatum:</label>
            <input
              type="date"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile.birthdate || ""}
              onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
            />
          </div>

          {/* Alter */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Alter:</label>
            <span style={{ flex: 2 }}>
              {profile.birthdate ? calculateAge(profile.birthdate) : "—"}
            </span>
          </div>

          {/* Anzahl Kinder */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Anzahl Kinder:</label>
            <input
              type="number"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile.num_children || 0}
              onChange={(e) => setProfile({ ...profile, num_children: parseInt(e.target.value) })}
            />
          </div>

          {/* Alter der Kinder */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Kinderalter (z.B. 3,5,8):</label>
            <input
              type="text"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile.children_ages?.join(",") || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  children_ages: e.target.value.split(",").map((n) => parseInt(n.trim()) || 0),
                })
              }
            />
          </div>

          {/* Wohnort */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Wohnort:</label>
            <input
              type="text"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>

          {/* Speichern-Button */}
          <button
            onClick={handleSave}
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}







              
