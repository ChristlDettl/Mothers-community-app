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
  return profile?.full_name && profile?.birthdate && profile?.city;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // <- NEU: Steuerung Bearbeitungsmodus

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

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
        setProfile({
          id: session.user.id,
          email: session.user.email,
          full_name: "",
          birthdate: "",
          city: "",
          num_children: 0,
          children_ages: [],
        });
      } else {
        setProfile(data);
      }

      setLoading(false);
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
      setEditing(false); // zurück in Ansicht
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
          Willkommen, {profile.full_name || user.email}
        </h1>

        {!editing ? (
          // 👉 Nur ANZEIGE, kein Bearbeiten
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p><strong>Name:</strong> {profile.full_name || "—"}</p>
            <p><strong>Geburtsdatum:</strong> {profile.birthdate || "—"}</p>
            <p><strong>Alter:</strong> {profile.birthdate ? calculateAge(profile.birthdate) : "—"}</p>
            <p><strong>Anzahl Kinder:</strong> {profile.num_children || "—"}</p>
            <p><strong>Kinderalter:</strong> {profile.children_ages?.join(", ") || "—"}</p>
            <p><strong>Wohnort:</strong> {profile.city || "—"}</p>

            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "20px",
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
          </div>
        ) : (
          // 👉 Bearbeitungsformular
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <input
              type="text"
              placeholder="Name"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
            <input
              type="date"
              placeholder="Geburtsdatum"
              value={profile.birthdate || ""}
              onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
            />
            <input
              type="number"
              placeholder="Anzahl Kinder"
              value={profile.num_children || 0}
              onChange={(e) => setProfile({ ...profile, num_children: parseInt(e.target.value) })}
            />
            <input
              type="text"
              placeholder="Kinderalter (z.B. 3,5,8)"
              value={profile.children_ages?.join(",") || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  children_ages: e.target.value.split(",").map((n) => parseInt(n.trim()) || 0),
                })
              }
            />
            <input
              type="text"
              placeholder="Wohnort"
              value={profile.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />

            <button onClick={handleSave}>Speichern</button>
            <button onClick={() => setEditing(false)}>Abbrechen</button>
          </div>
        )}
      </div>
    </div>
  );
}






                    
