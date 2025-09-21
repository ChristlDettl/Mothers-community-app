// pages/profiles.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

// Alter berechnen
function calculateAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filterstates
  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("id, full_name, birthdate, city, children(*)");

      if (error) {
        console.error("Fehler beim Laden der Profile:", error);
      } else {
        setProfiles(profilesData || []);
        setFilteredProfiles(profilesData || []);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  // Filter
  useEffect(() => {
    let results = [...profiles];

    if (searchName) {
      results = results.filter((p) =>
        p.full_name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchCity) {
      results = results.filter((p) =>
        p.city?.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    if (searchGender) {
      results = results.filter((p) =>
        p.children?.some((c: any) => c.gender === searchGender)
      );
    }

    if (minAge) {
      results = results.filter((p) =>
        p.children?.some((c: any) => c.age >= parseInt(minAge))
      );
    }

    if (maxAge) {
      results = results.filter((p) =>
        p.children?.some((c: any) => c.age <= parseInt(maxAge))
      );
    }

    setFilteredProfiles(results);
  }, [searchName, searchCity, searchGender, minAge, maxAge, profiles]);

  if (loading) return <p style={{ textAlign: "center" }}>Lade Profile...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Alle Mütter</h1>

        {/* Filter */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <input
            type="text"
            placeholder="Name suchen"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Stadt suchen"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <select
            value={searchGender}
            onChange={(e) => setSearchGender(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          >
            <option value="">Geschlecht wählen</option>
            <option value="junge">Junge</option>
            <option value="mädchen">Mädchen</option>
            <option value="keine Angabe">Keine Angabe</option>
          </select>
          <input
            type="number"
            placeholder="Mindestalter"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <input
            type="number"
            placeholder="Höchstalter"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Profile-Liste */}
        {filteredProfiles.map((profile) => {
          const age = calculateAge(profile.birthdate);

          return (
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
              <p><strong>Alter:</strong> {age !== null ? `${age} Jahre` : "—"}</p>
              <p><strong>Wohnort:</strong> {profile.city || "—"}</p>

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
          );
        })}
      </div>
    </div>
  );
}



