// pages/login.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: "400px", margin: "50px auto" }}>
        <h1>Login</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

