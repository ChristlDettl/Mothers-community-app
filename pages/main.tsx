// pages/main.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

export default function MainPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login"); // Wenn nicht eingeloggt → zurück zum Login
        return;
      }
      setUser(session.user);
    }

    checkSession();
  }, [router]);

  if (!user) return <p>Lade...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <NavBar />
      <div
        style={{
          maxWidth: "800px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#333" }}>🌸 Hauptseite</h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          Willkommen {user.email}! <br />
          Dies ist deine Hauptseite nach dem Login.
        </p>
      </div>
    </div>
  );
        }
