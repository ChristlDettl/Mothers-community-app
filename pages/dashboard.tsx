import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ensureUserProfile } from "../lib/profile";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
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

        const currentUser = data.session.user;
        setUser(currentUser);

        // Profil sicherstellen (falls nicht existiert → anlegen)
        await ensureUserProfile(currentUser);

        // Profil laden
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError) {
          console.error("Profil-Fehler:", profileError);
          setErrorMessage(`Profil-Fehler: ${profileError.message}`);
        } else {
          setProfile(profileData);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setErrorMessage(`Unerwarteter Fehler: ${err.message || err}`);
      }
    };

    fetchSessionAndProfile();
  }, []);

  // Speichern in Supabase
  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        birthdate: profile.birthdate,
        city: profile.city,
        children: profile.children, // erwartet JSON in Supabase
      })
      .eq("id", user.id);

    if (error) {
      console.error("Fehler beim Speichern:", error);
      setErrorMessage(`Fehler beim Speichern: ${error.message}`);
    } else {
      alert("Profil gespeichert ✅");
    }
  };

  if (errorMessage) return <p>{errorMessage}</p>;
  if (!profile) return <p>Lade Profil...</p>;

  return (
    <div>
      <h1>Willkommen, {profile.full_name || user?.email}</h1>

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
        type="text"
        placeholder="Wohnort"
        value={profile.city || ""}
        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
      />

      <textarea
        placeholder="Infos zu den Kindern (z.B. [{'age': 3}, {'age': 5}])"
        value={JSON.stringify(profile.children || [])}
        onChange={(e) =>
          setProfile({ ...profile, children: JSON.parse(e.target.value || "[]") })
        }
      />

      <button onClick={handleSave}>Speichern</button>

      <p>
        Alter:{" "}
        {profile.birthdate ? calculateAge(profile.birthdate) : "—"}
      </p>
    </div>
  );
}

// Hilfsfunktion zum Alter berechnen
function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}


