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

    try {
      // 1️⃣ Registrierung beim Auth-System
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Signup-Error:", signUpError);
        setError(signUpError.message);
        return;
      }

      // ✅ Signup erfolgreich
      console.log("User erfolgreich registriert:", data.user);

      // Hinweis an den User: Profil wird später angelegt
      setSuccess(true);
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Signup:", err);
      setError("Unerwarteter Fehler beim Signup");
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: 20 }}>
        <h1>Registrieren</h1>
        {success ? (
          <p>
            Registrierung erfolgreich! Bitte bestätige deine E-Mail. Dein Profil
            wird beim ersten Login im Dashboard automatisch erstellt.
          </p>
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
            {error && (
              <pre
                style={{
                  color: "red",
                  whiteSpace: "pre-wrap",
                  background: "#fee",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {error}
              </pre>
            )}
          </form>
        )}
      </div>
    </>
  );
}


