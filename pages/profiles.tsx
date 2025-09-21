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

// Entfernung berechnen (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Filterstates
  const [minMotherAge, setMinMotherAge] = useState("");
  const [maxMotherAge, setMaxMotherAge] = useState("");
  const [minChildAge, setMinChildAge] = useState("");
  const [maxChildAge, setMaxChildAge] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const userId = session?.user?.id;
        if (!userId) return;

        const { data: me } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        setUserProfile(me);

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, birthdate, city, latitude, longitude, children(*)");

        setProfiles(profilesData || []);
        setFilteredProfiles(profilesData || []);
      } catch (err) {
        console.error("Fehler beim Laden der Profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Filter anwenden
  useEffect(() => {
    let results = [...profiles];

    if (minMotherAge) {
      results = results.filter((p) => {
        const age = calculateAge(p.birthdate);
        return age !== null && age >= parseInt(minMotherAge);
      });
    }

    if (maxMotherAge) {
      results = results.filter((p) => {
        const age = calculateAge(p.birthdate);
        return age !== null && age <= parseInt(maxMotherAge);
      });
    }

    if (minChildAge) {
      results = results.filter((p) =>
        p.children?.some((c: any) => c.age >= parseInt(minChildAge))
      );
    }

    if (maxChildAge) {
      results = results.filter((p) =>
        p.children?.some((c: any) => c.age <= parseInt(maxChildAge))
      );
    }

    if (searchCity) {
      results = results.filter((p) =>
        p.city?.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    if (maxDistance && userProfile?.latitude && userProfile?.longitude) {
      results = results.filter((p) => {
        if (!p.latitude || !p.longitude) return false;
        const distance = getDistanceFromLatLonInKm(
          userProfile.latitude,
          userProfile.longitude,
          p.latitude,
          p.longitude
        );
        return distance <= parseFloat(maxDistance);
      });
    }

    setFilteredProfiles(results);
  }, [minMotherAge, maxMotherAge, minChildAge, maxChildAge, maxDistance, searchCity, profiles, userProfile]);

  if (loading) return <p style={{ textAlign: "center" }}>Lade Profile...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Alle Mütter</h1>

        {/* Button zum Aufklappen */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "10px 18px",
              backgroundColor: "#ede9fe", // Pastellviolett
              color: "#4c1d95", // dunkler Violettton
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
          >
            {showFilters ? "Filter ausblenden" : "Filter anzeigen"}
          </button>
        </div>

        {/* Filterbereich */}
        {showFilters && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "30px",
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <input
              type="number"
              placeholder="Mindestalter Mutter"
              value={minMotherAge}
              onChange={(e) => setMinMotherAge(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Höchstalter Mutter"
              value={maxMotherAge}
              onChange={(e) => setMaxMotherAge(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Mindestalter Kind"
              value={minChildAge}
              onChange={(e) => setMinChildAge(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Höchstalter Kind"
              value={maxChildAge}
              onChange={(e) => setMaxChildAge(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="text"
              placeholder="Wohnort"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Maximale Entfernung (km)"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
        )}

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
                position: "relative",
              }}
            >
              <h2>{profile.full_name || "Anonyme Mutter"}</h2>
              <p><strong>Alter Mutter:</strong> {age !== null ? `${age} Jahre` : "—"}</p>
              <p><strong>Wohnort:</strong> {profile.city || "—"}</p>

              <div>
                <strong>Kinder:</strong>
                {profile.children && profile.children.length > 0 ? (
                  <ul>
                    {profile.children.map((child: any, i: number) => {
                      let genderShort = "–";
                      if (child.gender === "male") genderShort = "m";
                      if (child.gender === "female") genderShort = "w";

                      const yearLabel = child.age === 1 ? "Jahr" : "Jahre";

                      return (
                        <li key={i}>
                          {child.age} {yearLabel} alt ({genderShort})
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>Keine Kinder eingetragen</p>
                )}
              </div>

              {/* Kontakt-Button */}
              <button
                onClick={() => alert(`Kontakt aufnehmen mit ${profile.full_name || "dieser Mutter"}`)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: "#ede9fe",
                  color: "#4c1d95",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
              >
                ✉️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
                  }

