// components/NavBar.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";

export default function NavBar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSender, setLastSender] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 🔐 Auth-Status überwachen
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        listener?.subscription?.unsubscribe?.();
      };
    }

    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"; // nach Logout zurück zur Start-Seite
  };

  // 🔔 Ungelesene Nachrichten + letzte Unterhaltung laden
  useEffect(() => {
    if (!user) return; // Nur laden, wenn eingeloggt

    const loadUnreadAndLast = async () => {
      const userId = user.id;
      if (!userId) return;

      // Ungelesene Nachrichten zählen
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .is("read_at", null);

      if (!error) {
        setUnreadCount(count || 0);
      }

      // Letzte empfangene Nachricht finden
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("sender_id, created_at")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (lastMsg && lastMsg.length > 0) {
        setLastSender(lastMsg[0].sender_id);
      } else {
        setLastSender(null);
      }
    };

    loadUnreadAndLast();

    // Echtzeit-Update
    const channel = supabase
      .channel("navbar-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        loadUnreadAndLast();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 📩 Klick-Handler Nachrichten
  const handleMessagesClick = () => {
    if (lastSender) {
      router.push(`/messages?receiver_id=${lastSender}`);
    } else {
      router.push("/messages");
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 25px",
        backgroundColor: "#ffffff",
        color: "#374151",
        flexWrap: "wrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo / Titel */}
      <h2
        style={{
          margin: 0,
          fontWeight: 700,
          fontFamily: "'Poppins', sans-serif",
          fontSize: "1.4rem",
          color: "#6d28d9",
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
        Mothers Community
      </h2>

      {/* Navigation rechts */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {user ? (
          <>
            {/* Nachrichten-Link mit Badge */}
            <button
              onClick={handleMessagesClick}
              style={{
                position: "relative",
                fontSize: "22px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              📩
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Hauptmenü */}
            <Link href="/main">
              <button
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
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ddd6fe")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ede9fe")
                }
              >
                Hauptmenü
              </button>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 18px",
                backgroundColor: "#fecaca",
                color: "#7f1d1d",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fca5a5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fecaca")
              }
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Login */}
            <button
              onClick={() => router.push("/login")}
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
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ddd6fe")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ede9fe")
              }
            >
              Login
            </button>

            {/* Neu registrieren */}
            <button
              onClick={() => router.push("/register")}
              style={{
                padding: "10px 18px",
                backgroundColor: "#f3e8ff",
                color: "#6d28d9",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e9d5ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#f3e8ff")
              }
            >
              Neu registrieren
            </button>
          </>
        )}
      </div>
    </nav>
  );
          }


