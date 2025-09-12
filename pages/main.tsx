// pages/main.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Main() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    }
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return <p>Lade...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f7f8fa" }}>
      <NavBar />
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#333" }}>
          Hallo {user.email}, willkommen auf der Hauptseite 🎉
        </h1>

        {/** Profil bearbeiten Button */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            margin: "10px",
            padding: "12px 20px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4338ca")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
        >
          Profil bearbeiten
        </button>

        {/** Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            margin: "10px",
            padding: "12px 20px",
            backgroundColor: "#ef4444",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}



