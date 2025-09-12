// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

// Alter berechnen
function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Prüfen, ob Profil vollständig ist
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Profil laden
  useEffect(() => {
    async function loadProfile() {
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

      if (error) console.error("Fehler beim Laden des Profils:", error);
      if (data) setProfile(data);

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // Weiterleitung, wenn Profil vollständig ist
  useEffect(() => {
    if (!loading && profile && isProfileComplete(profile)) {
      router.push("/main"); // /main = deine Hauptseite
    }
  }, [profile, loading, router]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Profil gespeichert!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <p>Lade...</p>;

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
              value={profile?.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          {/* Geburtsdatum */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Geburtsdatum:</label>
            <input
              type="date"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
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
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile?.num_children || 0}
              onChange={(e) => setProfile({ ...profile, num_children: parseInt(e.target.value) })}
            />
          </div>

          {/* Kinderalter */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Kinderalter (z.B. 3,5,8):</label>
            <input
              type="text"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile?.children_ages?.join(",") || ""}
              onChange={(e) =>
                setProfile({ ...profile, children_ages: e.target.value.split(",").map((n) => parseInt(n.trim()) || 0) })
              }
            />
          </div>

          {/* Wohnort */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <label style={{ flex: 1, fontWeight: 600 }}>Wohnort:</label>
            <input
              type="text"
              style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              value={profile?.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button
              onClick={handleSave}
              style={{ flex: 1, padding: "12px", backgroundColor: "#4f46e5", color: "#fff", fontWeight: 600, borderRadius: "10px", border: "none", cursor: "pointer" }}
            >
              Speichern
            </button>
            <button
              onClick={handleLogout}
              style={{ flex: 1, padding: "12px", backgroundColor: "#e53e3e", color: "#fff", fontWeight: 600, borderRadius: "10px", border: "none", cursor: "pointer" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



      
        
