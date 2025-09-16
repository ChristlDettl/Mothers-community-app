// pages/profiles.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, birthdate, city, children(*)"); // 👈 Lade Kinder direkt mit

      if (profilesError) {
        console.error("Fehler beim Laden der Profile:", profilesError);
      } else {
        setProfiles(profilesData || []);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Lade Profile...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Alle Mütter</h1>
        {profiles.map((profile) => (
          <div
            key={profile.id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2>{profile.full_name || "Anonyme Mutter"}</h2>
            <p><strong>Wohnort:</strong> {profile.city || "—"}</p>
            <p><strong>Geburtsdatum:</strong> {profile.birthdate || "—"}</p>

            <div>
              <strong>Kinder:</strong>
              {profile.children && profile.children.length > 0 ? (
                <ul>
                  {profile.children.map((child: any, i: number) => (
                    <li key={i}>
                      {child.age} Jahre alt ({child.gender || "keine Angabe"})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Keine Kinder eingetragen</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
