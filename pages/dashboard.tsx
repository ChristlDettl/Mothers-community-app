import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ensureUserProfile } from "../lib/profile";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Fehler beim Abrufen der Session:", error.message);
        return;
      }

      if (data?.session?.user) {
        setUser(data.session.user);
        await ensureUserProfile(data.session.user);
      }
    };

    fetchSession();
  }, []);

  return <div>{user ? `Willkommen, ${user.email}` : "Lade..."}</div>;
}


// Funktion zum Alter berechnen
function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
