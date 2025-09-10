import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ensureUserProfile } from "../lib/profile";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession(); // Session abrufen
    if (session?.user) {
      setUser(session.user);
      ensureUserProfile(session.user); // Profil anlegen, falls noch nicht vorhanden
    }
  }, []);

  return <div>{user ? `Willkommen, ${user.email}` : "Lade..."}</div>;
}
