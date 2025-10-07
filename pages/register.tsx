// pages/register.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("⚠️ Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Signup-Error:", signUpError);
        setError(signUpError.message);
        return;
      }

      console.log("✅ User erfolgreich registriert:", data.user);
      setSuccess(true);
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Signup:", err);
      setError("Unerwarteter Fehler beim Signup");
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: 20, maxWidth: 400, margin: "50px auto" }}>
        <h1 style={{ textAlign: "center", color: "#4c1d95" }}>Registrieren</h1>

        {success ? (
          <p
            style={{
              background: "#ecfdf5",
              padding: "15px",
              borderRadius: "10px",
              color: "#065f46",
              fontWeight: 500,
            }}
          >
            🎉 Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.
            Dein Profil wird beim ersten Login automatisch erstellt.
          </p>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 10 }}>
              <input
                type="email"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: "10px",
                  width: "100%",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: "10px",
                  width: "100%",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="password"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  padding: "10px",
                  width: "100%",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "10px 18px",
                backgroundColor: "#ede9fe",
                color: "#4c1d95",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                width: "100%",
              }}
            >
              Registrieren
            </button>

            {error && (
              <pre
                style={{
                  color: "red",
                  whiteSpace: "pre-wrap",
                  background: "#fee",
                  padding: "10px",
                  borderRadius: "5px",
                  marginTop: "10px",
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

