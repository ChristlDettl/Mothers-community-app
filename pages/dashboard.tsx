import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ensureUserProfile } from "../lib/profile";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ full_name: "", birth_date: "", num_children: 0, children_ages: [], city: "" });

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        await ensureUserProfile(data.session.user);

        // Lade Profil aus DB
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();
        if (profileData) setProfile(profileData);
      }
    };
    fetchSession();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);
    if (error) console.error(error);
    else alert("Profil gespeichert!");
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Willkommen, {user.email}</h1>
          <input
            type="text"
            placeholder="Name"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
          <input
            type="date"
            placeholder="Geburtsdatum"
            value={profile.birth_date}
            onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
          />
          <input
            type="number"
            placeholder="Anzahl Kinder"
            value={profile.num_children}
            onChange={(e) => setProfile({ ...profile, num_children: parseInt(e.target.value) })}
          />
          <input
            type="text"
            placeholder="Kinderalter (z.B. 3,5,8)"
            value={profile.children_ages.join(",")}
            onChange={(e) => setProfile({ ...profile, children_ages: e.target.value.split(",").map(Number) })}
          />
          <input
            type="text"
            placeholder="Wohnort"
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          />
          <button onClick={handleSave}>Speichern</button>

          <p>Alter: {profile.birth_date ? calculateAge(profile.birth_date) : "—"}</p>
        </div>
      ) : (
        <p>Lade...</p>
      )}
    </div>
  );
}

// Funktion zum Alter berechnen
function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
