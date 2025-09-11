import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const { error: insertError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: "",
        birthdate: null,
        city: "",
        children_ages: [],
        num_children: 0,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess(true);
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Registrieren</h1>
      {success ? (
        <p>Registrierung erfolgreich! Du kannst dich nun einloggen.</p>
      ) : (
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
      )}
    </div>
  );
}




