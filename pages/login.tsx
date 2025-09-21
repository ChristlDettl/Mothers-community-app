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
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error("Login-Error:", loginError);
        setError(loginError.message);
        return;
      }

      // Weiterleitung zum Dashboard bei erfolgreichem Login
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Login:", err);
      setError("Unerwarteter Fehler beim Login");
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: 20, maxWidth: 400, margin: "50px auto" }}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 10 }}>
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "8px", width: "100%", marginBottom: "8px" }}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: "8px", width: "100%", marginBottom: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{
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
          >
            Login
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
      </div>
    </>
  );
}


