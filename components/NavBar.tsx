// components/NavBar.tsx
import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{
      padding: "10px 20px",
      backgroundColor: "#f8f8f8",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Link href="/"><strong>Mütter-Community</strong></Link>
      <div style={{ display: "flex", gap: "10px" }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Registrieren</Link>
      </div>
    </nav>
  );
}

