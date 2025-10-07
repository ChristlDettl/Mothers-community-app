import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function ChangePassword() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Bitte fülle alle Felder aus.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Fehler beim Laden des Benutzers.");
        setLoading(false);
        return;
      }

      // Passwort direkt über Supabase ändern
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        alert("Fehler beim Ändern des Passworts: " + error.message);
      } else {
        alert("Passwort erfolgreich geändert!");
        router.push("/main");
      }
    } catch (err: any) {
      alert("Unerwarteter Fehler: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <NavBar />
      <div
        style={{
          maxWidth: "400px",
          margin: "80px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#6d28d9",
            fontSize: "1.6rem",
            marginBottom: "25px",
          }}
        >
          🔒 Passwort ändern
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="password"
            placeholder="Neues Passwort"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
            }}
          />
          <input
            type="password"
            placeholder="Neues Passwort bestätigen"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
            }}
          />

          <button
            onClick={handleChangePassword}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#ede9fe",
              color: "#4c1d95",
              fontWeight: 600,
              border: "none",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "10px",
            }}
          >
            {loading ? "Ändere Passwort..." : "Passwort speichern"}
          </button>

          <button
            onClick={() => router.push("/main")}
            style={{
              padding: "10px 18px",
              backgroundColor: "#fecaca",
              color: "#7f1d1d",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              marginTop: "10px",
            }}
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
}
