import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ensureUserProfile } from "../lib/profile";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setErrorMessage(`Session error: ${error.message}`);
          return;
        }

        if (!data?.session?.user) {
          setErrorMessage("Keine aktive Session gefunden. Bitte einloggen.");
          return;
        }

        setUser(data.session.user);
        await ensureUserProfile(data.session.user);
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setErrorMessage(`Unerwarteter Fehler: ${err.message || err}`);
      }
    };

    fetchSession();
  }, []);

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
