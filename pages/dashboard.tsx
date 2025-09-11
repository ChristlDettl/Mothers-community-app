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
          setErrorMessage(`Session error: ${error.message}`);
          return;
        }
        if (!data?.session?.user) {
          setErrorMessage("Keine aktive Session gefunden. Bitte einloggen.");
          return;
        }

        const currentUser = data.session.user;
        setUser(currentUser);

        await ensureUserProfile(currentUser);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError) {
          setErrorMessage(`Profil-Fehler: ${profileError.message}`);
        } else {
          // sicherstellen, dass children immer ein Array ist
          setProfile({
            ...profileData,
            children: profileData.children || [],
          });
        }
      } catch (err: any) {
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
        children: profile.children,
      })
      .eq("id", user.id);

    if (error) {
      setErrorMessage(`Fehler beim Speichern: ${error.message}`);
    } else {
      alert("Profil gespeichert ✅");
    }
  };

  // Hilfsfunktionen für Kinder
  const handleChildDateChange = (index: number, date: string) => {
    const updatedChildren = [...profile.children];
    updatedChildren[index] = { birthdate: date };
    setProfile({ ...profile, children: updatedChildren });
  };

  const addChild = () => {
    setProfile({
      ...profile,
      children: [...profile.children, { birthdate: "" }],
    });
  };

  const removeChild = (index: number) => {
    const updatedChildren = profile.children.filter(
      (_: any, i: number) => i !== index
    );
    setProfile({ ...profile, children: updatedChildren });
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

      <h3>Kinder</h3>
      {profile.children.map((child: any, index: number) => (
        <div key={index}>
          <input
            type="date"
            value={child.birthdate || ""}
            onChange={(e) => handleChildDateChange(index, e.target.value)}
          />
          {child.birthdate && (
            <span> Alter: {calculateAge(child.birthdate)} Jahre</span>
          )}
          <button onClick={() => removeChild(index)}>❌</button>
        </div>
      ))}
      <button onClick={addChild}>➕ Kind hinzufügen</button>

      <button onClick={handleSave}>Speichern</button>

      <p>
        Dein Alter:{" "}
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


    
