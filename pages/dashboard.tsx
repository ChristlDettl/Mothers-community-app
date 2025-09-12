// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

// Funktion zum Alter berechnen
function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Prüfen, ob das Profil vollständig ist
const isProfileComplete = (profile: any) => {
  return profile.full_name && profile.birthdate && profile.city;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    birthdate: "",
    num_children: 0,
    children_ages: [],
    city: "",
  });

  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login"); // Wenn kein User → zur Login-Seite
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) setProfile(data);
      if (error) console.error("Fehler beim Laden des Profils:", error);
    }

    loadProfile();
  }, [router]);

  // Weiterleitung, wenn Profil komplett ist
  useEffect(() => {
    if (profile && isProfileComplete(profile)) {
      router.push("/main"); // Weiterleitung zur Hauptseite
    }
  }, [profile, router]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Profil gespeichert!");
      if (isProfileComplete(profile)) {
        router.push("/main"); // Nach dem Speichern weiterleiten
      }
    }
  };

  if (!user) return <p>Lade...</p>;
  if (!profile) return <p>Lade Profil...</p>;

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
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
              value={profile?.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          {/* Geburtsdatum */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Geburtsdatum:</label>
            <input
              type="date"
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
              value={profile?.birthdate || ""}
              onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
            />
          </div>

          {/* Alter */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Alter:</label>
            <span style={{ flex: 2 }}>{profile.birthdate ? calculateAge(profile.birthdate) : "—"}</span>
          </div>

          {/* Anzahl Kinder */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Anzahl Kinder:</label>
            <input
              type="number"
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
              value={profile?.num_children || 0}
              onChange={(e) => setProfile({ ...profile, num_children: parseInt(e.target.value) })}
            />
          </div>

          {/* Alter der Kinder */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Kinderalter (z.B. 3,5,8):</label>
            <input
              type="text"
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
              value={profile?.children_ages?.join(",") || ""}
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
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
              value={profile?.city || ""}
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
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4338ca")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
            }



                    
