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

