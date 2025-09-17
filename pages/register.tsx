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

    if (data.user) {
      try {
        console.log("👉 Versuche Profil anzulegen für:", {
          id: data.user.id,
          email: data.user.email,
        });

        // 2️⃣ Prüfen, ob Profil schon existiert
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("❌ Fehler beim Überprüfen des Profils:", fetchError);
          setError("Fehler beim Überprüfen des Profils");
          return;
        }

        // 3️⃣ Profil anlegen, wenn noch nicht vorhanden
        if (!existingProfile) {
          const { error: insertError } = await supabase.from("profiles").insert([
            {
              email: data.user.email, // nur E-Mail, alles andere später im Dashboard
            },
          ]);

          if (insertError) {
            // RLS-Fehler (42501) ignorieren, andere Fehler weitergeben
            if (insertError.code === "42501") {
              console.warn(
                "RLS-Fehler beim Anlegen des Profils ignoriert:",
                insertError.message
              );
            } else {
              console.error("❌ Insert-Fehler:", insertError);
              setError(
                "Fehler beim Anlegen des Profils:\n" +
                  JSON.stringify(insertError, null, 2)
              );
              return;
            }
          }
        }

        // ✅ Registrierung + Profil erfolgreich
        setSuccess(true);
      } catch (err) {
        console.error("❌ Unerwarteter Fehler:", err);
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



