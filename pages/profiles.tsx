// pages/profiles.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { User, MapPin, Baby, Search } from "lucide-react";

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

  if (loading) return <p className="text-center">Lade Profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">Alle Mütter</h1>

        {/* Filterbereich */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
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
          <input
            type="number"
            placeholder="Maximale Entfernung (km)"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 shadow-sm"
          />
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <User className="text-purple-500" />
                <h2 className="text-xl font-semibold">
                  {profile.full_name || "Anonyme Mutter"}
                </h2>
              </div>
              <p className="text-gray-700 flex items-center gap-2">
                🎂 Alter: {calculateAge(profile.birthdate)}
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-500" />
                {profile.city || "Keine Angabe"}
              </p>
              <div className="mt-3">
                <strong>Kinder:</strong>
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
                  <p className="text-gray-500">Keine Kinder eingetragen</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
    }

