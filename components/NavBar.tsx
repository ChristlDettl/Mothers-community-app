// components/NavBar.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function NavBar() {
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // nach Logout zurück zur Start-Seite
  };

  // 🔔 Ungelesene Nachrichten laden
  useEffect(() => {
    const loadUnread = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .is("read_at", null);

      if (!error) {
        setUnreadCount(count || 0);
      }
    };

    loadUnread();

    // Echtzeit-Update für neue/aktualisierte Nachrichten
    const channel = supabase
      .channel("navbar-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.receiver_id) {
            loadUnread();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          loadUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        }}
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
        {/* Nachrichten-Link mit Badge */}
        <Link href="/messages" style={{ position: "relative", fontSize: "22px" }}>
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
        </Link>

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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd6fe")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fca5a5")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fecaca")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
                }

