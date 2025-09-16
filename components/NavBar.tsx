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
        padding: "15px 30px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <h2 style={{ margin: 0, fontWeight: 700 }}>Mothers Community</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: "300px", // Buttons begrenzen
        }}
      >
        {/* Hauptmenü-Button */}
        <Link href="/main">
          <button
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "#fff",
              color: "#4f46e5",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0ff")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            Hauptmenü
          </button>
        </Link>

        {/* Logout-Button */}
        <button
          onClick={handleLogout}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
