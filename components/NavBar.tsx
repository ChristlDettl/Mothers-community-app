import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link href="/login" style={{ marginRight: "1rem" }}>Login</Link>
      <Link href="/register" style={{ marginRight: "1rem" }}>Registrieren</Link>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
