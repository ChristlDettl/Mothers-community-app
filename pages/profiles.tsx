// pages/profiles.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

// Kleine interne SVG-Icons
function IconUser(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMapPin(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconMail(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 6 12 13 2 6" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
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
  const R = 6371; // Erdradius in km
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
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          const { data: me } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          setUserProfile(me);
        }

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email, birthdate, city, latitude, longitude, children(*)");

        setProfiles(profilesData || []);
        setFilteredProfiles(profilesData || []);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Filter + Sortierung
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

    // Sortierung nach Entfernung
    if (sortOption === "distance" && userProfile?.latitude && userProfile?.longitude) {
      results.sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1;
        if (!b.latitude || !b.longitude) return -1;
        const distA = getDistanceFromLatLonInKm(
          userProfile.latitude,
          userProfile.longitude,
          a.latitude,
          a.longitude
        );
        const distB = getDistanceFromLatLonInKm(
          userProfile.latitude,
          userProfile.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });
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
    sortOption,
    profiles,
    userProfile,
  ]);

  if (loading) return <p className="text-center mt-8">Lade Profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">Alle Mütter</h1>

        {/* Filterbereich */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <input
              type="text"
              placeholder="📍 Wohnort"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <select
              value={searchGender}
              onChange={(e) => setSearchGender(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">👶 Geschlecht Kind</option>
              <option value="male">Junge</option>
              <option value="female">Mädchen</option>
            </select>
            <input
              type="number"
              placeholder="Mindestalter Mutter"
              value={minMotherAge}
              onChange={(e) => setMinMotherAge(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm"
            />
            <input
              type="number"
              placeholder="Höchstalter Mutter"
              value={maxMotherAge}
              onChange={(e) => setMaxMotherAge(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm"
            />
            <input
              type="number"
              placeholder="Mindestalter Kind"
              value={minChildAge}
              onChange={(e) => setMinChildAge(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm"
            />
            <input
              type="number"
              placeholder="Höchstalter Kind"
              value={maxChildAge}
              onChange={(e) => setMaxChildAge(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm"
            />
            {/* Sortierung */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">🔀 Sortieren</option>
              <option value="distance">📍 Nach Entfernung</option>
            </select>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <IconUser className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {profile.full_name || "Anonyme Mutter"}
                  </h2>
                </div>
                <p className="text-gray-700 mb-1">🎂 Alter: {calculateAge(profile.birthdate)}</p>
                <p className="text-gray-700 flex items-center gap-2 mb-3">
                  <IconMapPin className="w-5 h-5 text-pink-500" />
                  {profile.city || "Keine Angabe"}
                </p>
                <div>
                  <strong className="text-gray-800">Kinder:</strong>
                  {profile.children && profile.children.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-600 mt-1">
                      {profile.children.map((child: any, i: number) => {
                        let genderShort = "–";
                        if (child.gender === "male") genderShort = "m";
                        if (child.gender === "female") genderShort = "w";
                        return (
                          <li key={i}>
                            {child.age} Jahre alt ({genderShort})
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-500 mt-1">Keine Kinder eingetragen</p>
                  )}
                </div>
              </div>

              {profile.email && (
                <button
                  onClick={() => (window.location.href = `mailto:${profile.email}`)}
                  className="mt-5 flex items-center justify-center gap-2 w-full 
                             bg-gradient-to-r from-purple-500 to-pink-500 
                             text-white py-2 px-4 rounded-xl shadow 
                             hover:opacity-90 transition"
                >
                  <IconMail className="w-5 h-5" />
                  Kontakt aufnehmen
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
