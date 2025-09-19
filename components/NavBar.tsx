// components/NavBar.tsx
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function NavBar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // nach Logout zurück zur Start-Seite
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 25px",
        backgroundColor: "#fef3c7", // warmes Beige
        color: "#4b3832", // dunkles Braun für Text
        flexWrap: "wrap",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        borderBottom: "2px solid #fcd34d", // goldene Linie unten
      }}
    >
      {/* Logo / Titel */}
      <h2
        style={{
          margin: 0,
          fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          fontSize: "1.4rem",
          color: "#9a3412", // warmes Terracotta
        }}
      >
        Mothers Community
      </h2>

      {/* Navigation rechts */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Hauptmenü */}
        <Link href="/main">
          <button
            style={{
              padding: "10px 18px",
              backgroundColor: "#fde68a", // helles warmes Gelb
              color: "#78350f", // braun-orange Text
              border: "1px solid #fcd34d",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "'Quicksand', sans-serif",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fcd34d")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fde68a")}
          >
            Hauptmenü
          </button>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            backgroundColor: "#fca5a5", // zartes Rosa
            color: "#7f1d1d", // dunkles Rotbraun
            border: "1px solid #f87171",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "'Quicksand', sans-serif",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fca5a5")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}


