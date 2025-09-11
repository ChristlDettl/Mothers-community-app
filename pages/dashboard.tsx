import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ensureUserProfile } from "../lib/profile";
import styles from "../styles/Dashboard.module.css"; // Styling importieren

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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

        // Profil laden
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (profileError) {
          console.error("Fehler beim Laden des Profils:", profileError);
          setErrorMessage("Profil konnte nicht geladen werden.");
          return;
        }

        setProfile(profileData);
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setErrorMessage(`Unerwarteter Fehler: ${err.message || err}`);
      }
    };

    fetchSession();
  }, []);

  async function handleSave() {
    if (!user || !profile) return;
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Profil gespeichert!");
    }
  }

  if (errorMessage) return <p>{errorMessage}</p>;
  if (!profile) return <p>Lade Profil...</p>;

  return (
    <div>
      <h1>Willkommen, {profile.full_name || user?.email}</h1>

      <form className={styles.form}>
        <label className={styles.label}>Name</label>
        <input
          type="text"
          className={styles.input}
          value={profile.full_name || ""}
          onChange={(e) =>
            setProfile({ ...profile, full_name: e.target.value })
          }
        />

        <label className={styles.label}>Geburtsdatum</label>
        <input
          type="date"
          className={styles.input}
          value={profile.birthdate || ""}
          onChange={(e) =>
            setProfile({ ...profile, birthdate: e.target.value })
          }
        />

        <label className={styles.label}>Anzahl Kinder</label>
        <input
          type="number"
          className={styles.input}
          value={profile.num_children || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              num_children: parseInt(e.target.value),
            })
          }
        />

        <label className={styles.label}>Kinderalter (z. B. 3,5,8)</label>
        <input
          type="text"
          className={styles.input}
          value={profile.children_ages?.join(",") || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              children_ages: e.target.value.split(",").map(Number),
            })
          }
        />

        <label className={styles.label}>Wohnort</label>
        <input
          type="text"
          className={styles.input}
          value={profile.city || ""}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
        />

        <button
          type="button"
          className={styles.button}
          onClick={handleSave}
        >
          Speichern
        </button>
      </form>

      <p>
        Alter:{" "}
        {profile.birthdate ? calculateAge(profile.birthdate) : "—"}
      </p>
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


      
