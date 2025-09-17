// pages/register.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Registrierung beim Auth-System
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Signup-Error:", signUpError);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      try {
        // 2. Prüfen, ob Profil schon existiert (optional)
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", data.user.email) // nach E-Mail prüfen
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Fehler beim Überprüfen des Profils:", fetchError);
          setError("Fehler beim Überprüfen des Profils");
          return;
        }

        // 3. Profil anlegen, wenn noch nicht vorhanden
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                email: data.user.email,
                full_name: null,
                birthdate: null,
                city: null,
                latitude: null,
                longitude: null,
              },
            ]); // 👈 keine ID setzen, RLS übernimmt auth.uid()

          if (insertError) {
            console.error("Fehler beim Anlegen des Profils:", insertError);
            setError("Fehler beim Anlegen des Profils: " + insertError.message);
            return;
          }
        }

        setSuccess(true);
      } catch (err) {
        console.error("Unerwarteter Fehler:", err);
        setError("Unerwarteter Fehler beim Anlegen des Profils");
      }
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: 20 }}>
        <h1>Registrieren</h1>
        {success ? (
          <p>Registrierung erfolgreich! Bitte bestätige deine E-Mail.</p>
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
    </>
  );
}
