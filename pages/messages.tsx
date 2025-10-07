// pages/messages.tsx
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

type MessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export default function Messages() {
  const router = useRouter();
  const receiver_id = Array.isArray(router.query.receiver_id)
    ? router.query.receiver_id[0]
    : router.query.receiver_id;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [receiverProfile, setReceiverProfile] = useState<any>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll nach unten bei neuen Nachrichten
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Nutzer laden
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        router.push("/login");
        return;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setUserProfile(me);
    };
    fetchUser();
  }, [router]);

  // Wenn kein Empfänger gewählt ist → Konversationsliste anzeigen
  useEffect(() => {
    const fetchConversations = async () => {
      if (!userProfile) return;

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userProfile.id},receiver_id.eq.${userProfile.id}`)
        .order("created_at", { ascending: false });

      if (!msgs) return;

      const partnerMap: Record<string, any> = {};
      for (const msg of msgs) {
        const partnerId =
          msg.sender_id === userProfile.id ? msg.receiver_id : msg.sender_id;
        if (!partnerMap[partnerId]) {
          partnerMap[partnerId] = msg;
        }
      }

      const partnerIds = Object.keys(partnerMap);
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", partnerIds);

        const convos = partnerIds.map((id) => ({
          partner: partners?.find((p) => p.id === id),
          lastMessage: partnerMap[id],
        }));

        setConversations(convos);
      }
    };

    if (!receiver_id) fetchConversations();
  }, [userProfile, receiver_id]);

  // Empfängerprofil + Nachrichten laden
  useEffect(() => {
    const fetchChat = async () => {
      if (!receiver_id || !userProfile) return;
      setLoading(true);

      const { data: receiver } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", receiver_id)
        .single();
      setReceiverProfile(receiver);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userProfile.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userProfile.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
      setLoading(false);
    };

    fetchChat();
  }, [userProfile, receiver_id]);

  // Realtime-Aktualisierung
  useEffect(() => {
    if (!userProfile || !receiver_id) return;

    const channel = supabase
      .channel("realtime-messages")
      .on<MessageRow>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${userProfile.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userProfile.id}))`,
        },
        (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile, receiver_id]);

  // Nachricht senden
  const sendMessage = async () => {
    if (!newMessage.trim() || !userProfile || !receiver_id) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: userProfile.id,
          receiver_id,
          content: newMessage.trim(),
        },
      ])
      .select();

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      setNewMessage("");
    }
  };

  // Wenn keine Chat-Partner-ID gegeben → Übersicht anzeigen
  if (!receiver_id) {
    return (
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <NavBar />
        <div
          style={{
            maxWidth: "700px",
            margin: "40px auto",
            padding: "20px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#4c1d95" }}>
            Meine Nachrichten
          </h2>
          {conversations.length === 0 ? (
            <p style={{ textAlign: "center" }}>Keine Nachrichten gefunden.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {conversations.map((c) => (
                <div
                  key={c.partner?.id}
                  onClick={() =>
                    router.push(`/messages?receiver_id=${c.partner?.id}`)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    padding: "10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: "#f3f4f6",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ede9fe")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                >
                  <img
                    src={
                      c.partner?.avatar_url
                        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${c.partner.avatar_url}`
                        : "/default-avatar.png"
                    }
                    alt="Profil"
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {c.partner?.full_name}
                    </p>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.9rem",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "250px",
                      }}
                    >
                      {c.lastMessage?.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Einzelchat anzeigen
  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <NavBar />
      <div
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <button
          onClick={() => router.push("/messages")}
          style={{
            marginBottom: "10px",
            background: "none",
            border: "none",
            color: "#6d28d9",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Zurück zur Übersicht
        </button>

        <h2 style={{ textAlign: "center", color: "#4c1d95" }}>
          Chat mit {receiverProfile?.full_name}
        </h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Lade Nachrichten...</p>
        ) : (
          <>
            <div
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "10px 0",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf:
                      msg.sender_id === userProfile?.id
                        ? "flex-end"
                        : "flex-start",
                    backgroundColor:
                      msg.sender_id === userProfile?.id
                        ? "#ede9fe"
                        : "#f3f4f6",
                    padding: "10px 15px",
                    borderRadius: "12px",
                    maxWidth: "75%",
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <small style={{ color: "#6b7280" }}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Nachricht schreiben..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
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
          </>
        )}
      </div>
    </div>
  );
                         }




          
