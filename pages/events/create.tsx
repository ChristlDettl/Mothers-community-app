// pages/events/create.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import NavBar from "../../components/NavBar";
import { useRouter } from "next/router";

export default function CreateEvent() {
  const router = useRouter();

  // Formular-State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [link, setLink] = useState("");

  // Bild
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleCreateEvent(e: any) {
    e.preventDefault();

    setUploading(true);

    // Prüfen: eingeloggt?
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      alert("Du musst eingeloggt sein.");
      return;
    }

    let image_url = null;

    // Bild hochladen falls vorhanden
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `event_${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-images")
        .upload(filePath, image);

      if (uploadError) {
        console.error(uploadError);
        alert("Fehler beim Bild-Upload");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("public-images")
        .getPublicUrl(filePath);

      image_url = urlData.publicUrl;
    }

    // Event in DB speichern
    const { error } = await supabase.from("events").insert({
      creator_id: userData.user.id,
      title,
      description,
      location,
      date,
      time: time || null,
      age_group: ageGroup || null,
      is_free: isFree,
      link: link || null,
      image_url,
    });

    setUploading(false);

    if (error) {
      console.error(error);
      alert("Fehler beim Erstellen des Events");
      return;
    }

    router.push("/events");
  }

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <NavBar />

      <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            color: "#6d28d9",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Neue Veranstaltung erstellen
        </h1>

        <form
          onSubmit={handleCreateEvent}
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "16px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* Titel */}
          <label style={{ fontWeight: 600 }}>Titel</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          {/* Beschreibung */}
          <label style={{ fontWeight: 600 }}>Beschreibung</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, height: "120px" }}
          />

          {/* Ort */}
          <label style={{ fontWeight: 600 }}>Ort</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle}
          />

          {/* Datum */}
          <label style={{ fontWeight: 600 }}>Datum</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />

          {/* Uhrzeit */}
          <label style={{ fontWeight: 600 }}>Uhrzeit (optional)</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={inputStyle}
          />

          {/* Altersgruppe */}
          <label style={{ fontWeight: 600 }}>Altersgruppe (optional)</label>
          <input
            placeholder="z.B. 0–3 Jahre"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            style={inputStyle}
          />

          {/* Kostenlos / nicht kostenlos */}
          <label style={{ fontWeight: 600 }}>Kostenlos?</label>
          <select
            value={isFree ? "free" : "paid"}
            onChange={(e) => setIsFree(e.target.value === "free")}
            style={inputStyle}
          >
            <option value="free">Ja</option>
            <option value="paid">Nein</option>
          </select>

          {/* Link */}
          <label style={{ fontWeight: 600 }}>Link (optional)</label>
          <input
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={inputStyle}
          />

          {/* Bild */}
          <label style={{ fontWeight: 600 }}>Bild (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            style={{ margin: "10px 0" }}
          />

          {/* Vorschau */}
          {image && (
            <img
              src={URL.createObjectURL(image)}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "10px",
              }}
            />
          )}

          <button
            type="submit"
            disabled={uploading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#6d28d9",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "10px",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "Speichere..." : "Veranstaltung erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Wiederverwendbarer Style
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  margin: "6px 0 15px 0",
  fontSize: "1rem",
  backgroundColor: "#f3f4f6",
};
