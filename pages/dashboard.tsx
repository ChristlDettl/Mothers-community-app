// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

function calculateAge(birthDate: string) {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const isProfileComplete = (profile: any) => {
  if (!profile) return false;
  return !!(profile.full_name && profile.birthdate && profile.city);
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const run = async () => {
      try {
        const editParam = router.query.edit === "1" || router.query.edit === "true";
        setEditing(editParam);

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

        if (isProfileComplete(data) && !editParam) {
          router.push("/main");
        }
      } catch (err) {
        console.error("Unerwarteter Fehler im Dashboard:", err);
      }
    };

    run();
  }, [router.isReady]);

  const handleSave = async () => {
    if (!user || !profile) return;
    const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" }).eq("id", user.id);
    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Profil gespeichert!");
      setEditing(false);
      if (isProfileComplete(profile)) router.push("/main");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Lade...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>Nicht eingeloggt</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f7f8fa" }}>
      <NavBar />
      <div
        style={{
          maxWidth: "700px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
          Willkommen, {profile?.full_name || user?.email}
        </h1>

        {!editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p><strong>Name:</strong> {profile?.full_name || "—"}</p>
            <p><strong>Geburtsdatum:</strong> {profile?.birthdate || "—"}</p>
            <p><strong>Alter:</strong> {calculateAge(profile?.birthdate)}</p>
            <p><strong>Anzahl Kinder:</strong> {profile?.num_children ?? "—"}</p>
            <p><strong>Kinderalter:</strong> {Array.isArray(profile?.children_ages) ? profile.children_ages.join(", ") : "—"}</p>
            <p><strong>Wohnort:</strong> {profile?.city || "—"}</p>

            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                borderRadius: "10px",
              }}
            >
              Profil bearbeiten
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "15px 20px",
              alignItems: "center",
            }}
          >
            <label style={{ fontWeight: 600 }}>Name:</label>
            <input
              type="text"
              value={profile?.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ fontWeight: 600 }}>Geburtsdatum:</label>
            <input
              type="date"
              value={profile?.birthdate || ""}
              onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ fontWeight: 600 }}>Anzahl Kinder:</label>
            <input
              type="number"
              value={profile?.num_children || 0}
              onChange={(e) => setProfile({ ...profile, num_children: parseInt(e.target.value || "0") })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ fontWeight: 600 }}>Kinderalter (z.B. 3,5,8):</label>
            <input
              type="text"
              value={Array.isArray(profile?.children_ages) ? profile.children_ages.join(",") : ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  children_ages: e.target.value.split(",").map((s) => parseInt(s.trim()) || 0),
                })
              }
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ fontWeight: 600 }}>Wohnort:</label>
            <input
              type="text"
              value={profile?.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <div></div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSave}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "10px",
                  flex: 1,
                }}
              >
                Speichern
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: "10px",
                  flex: 1,
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





            
