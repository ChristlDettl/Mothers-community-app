// pages/messages.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;

        // Eigene Profildaten
        const { data: me } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        setUserProfile(me);

        // Nachrichten abrufen, inkl. Absenderprofil
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, content, created_at, sender_id, sender:sender_id(full_name)")
          .eq("receiver_id", userId)
          .order("created_at", { ascending: false });

        setMessages(msgs || []);
      } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Lade Nachrichten...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Inbox</h1>

        {messages.length === 0 && <p style={{ textAlign: "center" }}>Keine Nachrichten.</p>}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "15px 20px",
              marginBottom: "15px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ margin: "0 0 5px 0", fontWeight: 600 }}>
              Von: {msg.sender?.full_name || "Anonymer Absender"}
            </p>
            <p style={{ margin: "0 0 5px 0" }}>{msg.content}</p>
            <small style={{ color: "#666" }}>
              {new Date(msg.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
          }
