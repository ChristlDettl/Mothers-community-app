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
          <p><form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            /></p>
            <p><input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            /></p>
            <p>
            <button style={{
              padding: "10px 18px",
              backgroundColor: "#ede9fe", // zartes Pastellviolett
              color: "#4c1d95", // dunkler Violettton
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
              type="submit">Registrieren</button>
              </p>
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


