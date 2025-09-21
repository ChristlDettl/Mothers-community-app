// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

function calculateAge(birthDate: string) {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const isProfileComplete = (profile: any) => {
  if (!profile) return false;
  return !!(profile.full_name && profile.birthdate && profile.city);
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const run = async () => {
      try {
        const editParam =
          router.query.edit === "1" || router.query.edit === "true";
        setEditing(editParam);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }
        setUser(session.user);

        // Profil laden
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Fehler beim Laden des Profils:", profileError);
          setProfile({
            id: session.user.id,
            email: session.user.email,
            full_name: "",
            birthdate: "",
            city: "",
          });
        } else {
          setProfile(profileData);
        }

        // Kinder laden
        const { data: childrenData, error: childrenError } = await supabase
          .from("children")
          .select("*")
          .eq("profile_id", session.user.id);

        if (childrenError) {
          console.error("Fehler beim Laden der Kinder:", childrenError);
          setChildren([]);
        } else {
          setChildren(childrenData || []);
        }

        setLoading(false);

        if (isProfileComplete(profileData) && !editParam) {
          router.push("/main");
        }
      } catch (err) {
        console.error("Unerwarteter Fehler im Dashboard:", err);
      }
    };

    run();
  }, [router.isReady]);

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      // 1. Geocoding
      let latitude = profile.latitude;
      let longitude = profile.longitude;

      if (profile.city) {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            profile.city
          )}`
        );
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      }

      const profileToSave = { ...profile, latitude, longitude };

      // 2. Profil speichern
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileToSave, { onConflict: "id" })
        .eq("id", user.id);

      if (profileError) {
        alert("Fehler beim Speichern: " + profileError.message);
        return;
      }

      // 3. Kinder speichern
      await supabase.from("children").delete().eq("profile_id", user.id);

      if (children.length > 0) {
        const { error: childrenError } = await supabase
          .from("children")
          .insert(children.map((c) => ({ ...c, profile_id: user.id })));

        if (childrenError) {
          alert("Fehler beim Speichern der Kinder: " + childrenError.message);
          return;
        }
      }

      alert("Profil gespeichert!");
      setProfile(profileToSave);
      setEditing(false);
      if (isProfileComplete(profile)) router.push("/main");
    } catch (err) {
      console.error("Fehler beim Geocoding/Speichern:", err);
      alert("Fehler beim Speichern des Profils");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Lade...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>Nicht eingeloggt</p>;

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
          maxWidth: "750px",
          margin: "60px auto",
          padding: "35px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#6d28d9",
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          Willkommen, {profile?.full_name || user?.email}
        </h1>

        {!editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p><strong>Name:</strong> {profile?.full_name || "—"}</p>
            <p><strong>Geburtsdatum:</strong> {profile?.birthdate || "—"}</p>
            <p><strong>Alter:</strong> {calculateAge(profile?.birthdate)}</p>
            <p><strong>Kinder:</strong></p>
            <ul>
              {children.length > 0 ? (
                children.map((child, i) => (
                  <li key={child.id || i}>
                    Kind {i + 1}: {child.age} Jahre{" "}
                    {child.gender === "male"
                      ? "(Junge)"
                      : child.gender === "female"
                      ? "(Mädchen)"
                      : ""}
                  </li>
                ))
              ) : (
                <li>Keine Kinder eingetragen</li>
              )}
            </ul>
            <p><strong>Wohnort:</strong> {profile?.city || "—"}</p>

            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                backgroundColor: "#ede9fe",
                color: "#4c1d95",
                fontWeight: 600,
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
            >
              Profil bearbeiten
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "15px 20px",
              alignItems: "center",
            }}
          >
            {/* Eingaben */}
            <label style={{ fontWeight: 600 }}>Name:</label>
            <input
              type="text"
              value={profile?.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />

            <label style={{ fontWeight: 600 }}>Geburtsdatum:</label>
            <input
              type="date"
              value={profile?.birthdate || ""}
              onChange={(e) =>
                setProfile({ ...profile, birthdate: e.target.value })
              }
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />

            <label style={{ fontWeight: 600 }}>Wohnort:</label>
            <input
              type="text"
              value={profile?.city || ""}
              onChange={(e) =>
                setProfile({ ...profile, city: e.target.value })
              }
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />

            {/* Kinder */}
            <label style={{ fontWeight: 600 }}>Kinder:</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {children.map((child, i) => (
                <div key={child.id || i} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <span>Kind {i + 1}:</span>
                    <input
                      type="number"
                      placeholder="z. B. 5"
                      value={child.age || ""}
                      onChange={(e) => {
                        const newChildren = [...children];
                        newChildren[i] = {
                          ...newChildren[i],
                          age: parseInt(e.target.value || "0"),
                        };
                        setChildren(newChildren);
                      }}
                      style={{
                        padding: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        width: "80px",
                      }}
                    />

                    <select
                      value={child.gender || "none"}
                      onChange={(e) => {
                        const newChildren = [...children];
                        newChildren[i] = { ...newChildren[i], gender: e.target.value };
                        setChildren(newChildren);
                      }}
                      style={{
                        padding: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                      }}
                    >
                      <option value="none">Keine Angabe</option>
                      <option value="male">Junge</option>
                      <option value="female">Mädchen</option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setChildren(children.filter((_, idx) => idx !== i))
                      }
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#fca5a5",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      ❌
                    </button>
                  </div>
                  <small style={{ color: "#6b7280", marginLeft: "65px" }}>
                    Alter und Geschlecht deines Kindes
                  </small>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setChildren([...children, { profile_id: user.id, age: 0, gender: "none" }])
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  backgroundColor: "#e5e7eb",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                ➕ Kind hinzufügen
              </button>
            </div>

            {/* Buttons */}
            <div></div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
               onClick={handleSave}
               style={{
               padding: "12px 20px",
               backgroundColor: "#ede9fe", // Pastellviolett
               color: "#4c1d95", // dunkler Violettton
               fontWeight: 600,
               border: "none",
               borderRadius: "12px",
               flex: 1,
               cursor: "pointer",
               transition: "all 0.2s ease",
               boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
               }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
              >
              Speichern
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#fecaca", // zartes Rosa
                  color: "#7f1d1d", // dunkles Rotbraun
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                 }}
                    >
                      Abbrechen
                </button>
            </div>

            {/* Account löschen */}
            <div
              style={{
                gridColumn: "1 / span 2",
                marginTop: "30px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "20px",
              }}
            >
              <h3 style={{ color: "#b91c1c", marginBottom: "10px" }}>
                ⚠️ Account löschen
              </h3>
              <p style={{ color: "#555", marginBottom: "15px" }}>
                Wenn du dein Profil und deinen Account löschst, werden alle
                deine Daten unwiderruflich entfernt.
              </p>
              <button
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Bist du sicher, dass du dein Konto endgültig löschen möchtest?\n\n" +
                      "Dieser Vorgang kann NICHT rückgängig gemacht werden!"
                  );
                  if (!confirmed) return;

                  try {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) {
                      alert("Kein Nutzer gefunden.");
                      return;
                    }

                    const response = await fetch("/api/deleteAccount", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                      alert("Fehler beim Löschen: " + result.error);
                      return;
                    }

                    alert("Dein Account wurde erfolgreich gelöscht.");
                    await supabase.auth.signOut();
                    router.push("/login");
                  } catch (err: any) {
                    alert("Unerwarteter Fehler: " + err.message);
                  }
                }}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Profil & Account löschen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
                    }

