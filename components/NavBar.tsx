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
        backgroundColor: "#ffffff", // weiß, clean
        color: "#374151", // neutral dark gray
        flexWrap: "wrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)", // sanfter Schatten
      }}
    >
      {/* Logo / Titel */}
      <h2
        style={{
          margin: 0,
          fontWeight: 700,
          fontFamily: "'Poppins', sans-serif",
          fontSize: "1.4rem",
          color: "#6d28d9", // Pastellviolett
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
              backgroundColor: "#ede9fe", // zartes Pastellviolett
              color: "#4c1d95", // dunkler Violettton
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
          >
            Hauptmenü
          </button>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            backgroundColor: "#fecaca", // zartes Rosa
            color: "#7f1d1d", // dunkles Rotbraun
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fca5a5")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fecaca")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

