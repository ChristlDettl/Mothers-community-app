// pages/index.tsx
import NavBar from "../components/NavBar";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <NavBar />
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Willkommen bei der Mütter-Community</h1>
        <p>Bitte wähle eine Option:</p>
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "20px" }}>
          <Link href="/login">
            <button style={{ padding: "10px 20px" }}>Login</button>
          </Link>
          <Link href="/register">
            <button style={{ padding: "10px 20px" }}>Neu registrieren</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
