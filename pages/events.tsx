// pages/events.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

type EventItem = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string | null;
  age_group: string | null;
  is_free: boolean;
  image_url: string | null;
  link: string | null;
};

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().slice(0, 10)) // nur zukünftige
        .order("date", { ascending: true });

      if (error) {
        console.error("Fehler beim Laden:", error);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <NavBar />

      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1
          style={{
            fontSize: "1.9rem",
            color: "#6d28d9",
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          Veranstaltungen
        </h1>

        {/* Button: neues Event erstellen */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <button
            onClick={() => router.push("/events/create")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ede9fe",
              color: "#4c1d95",
              border: "none",
              borderRadius: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ➕ Veranstaltung hinzufügen
          </button>
        </div>

        {loading && <p style={{ textAlign: "center" }}>Lade Veranstaltungen...</p>}

        {!loading && events.length === 0 && (
          <p style={{ textAlign: "center" }}>Keine Veranstaltungen gefunden.</p>
        )}

        {/* Veranstaltungsliste */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: "20px",
          }}
        >
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
                padding: "15px",
                overflow: "hidden",
              }}
            >
              {ev.image_url && (
                <img
                  src={ev.image_url}
                  alt="Event"
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "10px",
                  }}
                />
              )}

              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "1.2rem",
                  color: "#4c1d95",
                }}
              >
                {ev.title}
              </h2>

              <p style={{ margin: "4px 0", color: "#374151" }}>
                📍 {ev.location}
              </p>

              <p style={{ margin: "4px 0", color: "#374151" }}>
                📅 {new Date(ev.date).toLocaleDateString()}
                {ev.time && ` · ${ev.time.slice(0, 5)} Uhr`}
              </p>

              {ev.age_group && (
                <p style={{ margin: "4px 0", color: "#6b7280" }}>
                  👶 {ev.age_group}
                </p>
              )}

              {ev.is_free ? (
                <p style={{ margin: "4px 0", color: "green", fontWeight: 600 }}>
                  Kostenlos
                </p>
              ) : (
                <p style={{ margin: "4px 0", color: "#6b7280" }}>Eintritt: —</p>
              )}

              <p
                style={{
                  marginTop: "10px",
                  color: "#374151",
                  fontSize: "0.95rem",
                }}
              >
                {ev.description?.slice(0, 120)}...
              </p>

              {ev.link && (
                <a
                  href={ev.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    color: "#6d28d9",
                    fontWeight: 600,
                  }}
                >
                  ➜ Mehr Infos
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
