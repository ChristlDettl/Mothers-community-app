import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar"; // Passe ggf. den Pfad an

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Supabase Registrierung
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Supabase Registrierung
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  if (data.user) {
    try {
      // Profil nur erstellen, wenn nicht vorhanden
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id) // 👈 besser nach User-ID als nach Email suchen
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Fehler beim Überprüfen des Profils:", fetchError);
        setError("Fehler beim Überprüfen des Profils");
        return;
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: null,
          birthdate: null,
          city: null,
          latitude: null,
          longitude: null,
        });

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
          <p>Registrierung erfolgreich! Bitte einloggen.</p>
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



          

