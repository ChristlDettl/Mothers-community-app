import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar"; // 👈 NavBar importieren

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      // Profil in Tabelle eintragen
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
      });
    }
  };

  return (
    <div>
      {/* 👇 NavBar wird hier angezeigt */}
      <NavBar />

      <h1>Registrieren</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrieren</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
      }


