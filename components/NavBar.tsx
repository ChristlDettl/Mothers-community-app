// components/NavBar.tsx
import { supabase } from "../lib/supabaseClient";

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
      }}
    >
      <h2 style={{ margin: 0, fontWeight: 700 }}>Mothers Community</h2>

      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
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
    </nav>
  );
}


