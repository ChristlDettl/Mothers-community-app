// pages/messages.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export default function Messages() {
  const router = useRouter();
  const { receiver_id } = router.query;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [receiverProfile, setReceiverProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  // Eigene Profildaten laden
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;

        const { data: me } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        setUserProfile(me);

        if (receiver_id) {
          const { data: receiver } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", receiver_id)
            .single();
          setReceiverProfile(receiver);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Profile:", err);
      }
    };

    fetchProfiles();
  }, [receiver_id]);

  // Nachrichten laden
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userProfile || !receiver_id) return;
      setLoading(true);
      try {
        const { data: msgs } = await supabase
          .from<Message>("messages") // nur 1 Typ
          .select("*")
          .or(
            `and(sender_id.eq.${userProfile.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userProfile.id})`
          )
          .order("created_at", { ascending: true });
        setMessages(msgs || []);
      } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userProfile, receiver_id]);

  // Nachricht senden
  const sendMessage = async () => {
    if (!newMessage.trim() || !userProfile || !receiver_id) return;

    try {
      const { data, error } = await supabase
        .from<Message>("messages") // nur 1 Typ
        .insert([
          {
            sender_id: userProfile.id,
            receiver_id,
            content: newMessage.trim(),
          },
        ]);

      if (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
        return;
      }

      if (data && data.length > 0) {
        setMessages((prev) => [...prev, data[0]]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Fehler beim Senden der Nachricht:", err);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Lade Nachrichten...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          {receiverProfile ? `Chat mit ${receiverProfile.full_name}` : "Inbox"}
        </h1>

        {/* Nachrichtenbereich */}
        <div
          style={{
            marginBottom: "20px",
            maxHeight: "60vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 && <p style={{ textAlign: "center" }}>Keine Nachrichten.</p>}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                backgroundColor: msg.sender_id === userProfile?.id ? "#ede9fe" : "#fff",
                padding: "10px 15px",
                borderRadius: "12px",
                marginBottom: "10px",
                alignSelf: msg.sender_id === userProfile?.id ? "flex-end" : "flex-start",
                maxWidth: "80%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ margin: 0 }}>{msg.content}</p>
              <small style={{ color: "#666" }}>
                {new Date(msg.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>

        {/* Neue Nachricht */}
        {receiverProfile && (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Nachricht schreiben..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "10px 18px",
                backgroundColor: "#4c1d95",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Senden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

