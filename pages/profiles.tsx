// pages/profiles.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

// Kleine interne SVG-Icons (ersetzen lucide-react)
function IconUser({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMapPin({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M21 8.5l-9 6-9-6" />
      <path d="M3 8.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
    </svg>
  );
}

// Alter berechnen
function calculateAge(birthDate: string) {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Entfernung berechnen
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
  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [minChildAge, setMinChildAge] = useState("");
  const [maxChildAge, setMaxChildAge] = useState("");
  const [minMotherAge, setMinMotherAge] = useState("");
  const [maxMotherAge, setMaxMotherAge] = useState("");
  const [maxDistance, setMaxDistance] = useState("");

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
          .select("id, full_name, email, birthdate, city, latitude, longitude, children(*)");

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
    if (searchGender) {
      results = results.filter((p) =>
        p.children?.some((c: any) => c.gender === searchGender)
      );
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
    if (minMotherAge) {
      results = results.filter((p) => calculateAge(p.birthdate) >= parseInt(minMotherAge));
    }
    if (maxMotherAge) {
      results = results.filter((p) => calculateAge(p.birthdate) <= parseInt(maxMotherAge));
    }

    setFilteredProfiles(results);
  }, [
    searchName,
    searchCity,
    searchGender,
    minChildAge,
    maxChildAge,
    minMotherAge,
    maxMotherAge,
    maxDistance,
    profiles,
    userProfile,
  ]);

  if (loading) return <p style={{ textAlign: "center" }}>Lade Profile...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Alle Mütter</h1>

        {/* Filterbereich */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="Name suchen"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Wohnort suchen"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
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
          <select
            value={searchGender}
            onChange={(e) => setSearchGender(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          >
            <option value="">Geschlecht des Kindes wählen</option>
            <option value="male">Junge</option>
            <option value="female">Mädchen</option>
            <option value="none">Keine Angabe</option>
          </select>
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
            type="number"
            placeholder="Maximale Entfernung (km)"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Profile-Übersicht */}
        {filteredProfiles.map((profile) => (
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
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <IconUser className="user-icon" style={{ width: 24, height: 24, color: "#7c3aed" } as any} />
              <h2 style={{ margin: 0 }}>{profile.full_name || "Anonyme Mutter"}</h2>
            </div>

            <p style={{ margin: "6px 0" }}><strong>Alter:</strong> {calculateAge(profile.birthdate)}</p>
            <p style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <IconMapPin className="pin-icon" style={{ width: 18, height: 18, color: "#ec4899" } as any} />
              {profile.city || "Keine Angabe"}
            </p>

            <div style={{ marginTop: 10 }}>
              <strong>Kinder:</strong>
              {profile.children && profile.children.length > 0 ? (
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  {profile.children.map((child: any, i: number) => {
                    let genderShort = "–";
                    if (child.gender === "male") genderShort = "m";
                    if (child.gender === "female") genderShort = "w";
                    return (
                      <li key={i} style={{ marginBottom: 6 }}>
                        {child.age} Jahre alt ({genderShort})
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p style={{ color: "#666" }}>Keine Kinder eingetragen</p>
              )}
            </div>

            {profile.email && (
              <button
                onClick={() => (window.location.href = `mailto:${profile.email}`)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#7c3aed",
                  color: "#fff",
                  padding: "10px 14px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <IconMail className="mail-icon" style={{ width: 18, height: 18, color: "white" } as any} />
                Kontakt aufnehmen
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



