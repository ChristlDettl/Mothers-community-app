import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
      } else {
        // nicht eingeloggt → zurück zum Login
        router.push("/");
      }
    };

    getUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!user) return <p>Lade Dashboard...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Willkommen im Dashboard 🎉</h1>
      <p>Du bist eingeloggt als: <strong>{user.email}</strong></p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
            }
