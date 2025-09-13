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
  if (!profile) return false;
  return profile.full_name && profile.birthdate && profile.city;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // Profil bearbeiten

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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

    loadProfile();
  }, [router]);

  useEffect(() => {
    if (!loading && profile && isProfileComplete(profile)) {
      router.push("/main"); // weiterleiten, wenn Profil vollständig
    }
  }, [profile, loading, router]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Profil gespeichert!");
      setEditing(false); // nach Speichern zurück
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Lade...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>Nicht eingeloggt</p>;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f7f8fa",
      }}
    >
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
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
          }}
        >
          Willkommen, {profile?.full_name || user.email}
        </h1>

        {editing ? (
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
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
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
                onChange={(e) =>
                  setProfile({ ...profile, birthdate: e.target.value })
                }
              />
            </div>

            {/* Alter */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <label style={{ flex: 1, fontWeight: 600 }}>Alter:</label>
              <span style={{ flex: 2 }}>
                {profile?.birthdate ? calculateAge(profile.birthdate) : "—"}
              </span>
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
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    num_children: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* Alter der Kinder */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <label style={{ flex: 1, fontWeight: 600 }}>
                Kinderalter (z.B. 3,5,8):
              </label>
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
                    children_ages: e.target.value
                      .split(",")
                      .map((n) => parseInt(n.trim()) || 0),
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
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
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
        ) : (
          <div style={{ textAlign: "center" }}>
            <p>
              <strong>Name:</strong> {profile?.full_name || "—"}
            </p>
            <p>
              <strong>Geburtsdatum:</strong> {profile?.birthdate || "—"}
            </p>
            <p>
              <strong>Wohnort:</strong> {profile?.city || "—"}
            </p>

            <button
              onClick={() => setEditing(true)}
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
              Profil bearbeiten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}







                      
