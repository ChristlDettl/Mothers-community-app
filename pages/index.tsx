// pages/index.tsx
import NavBar from "../components/NavBar";
import Link from "next/link";
import React from "react";

export default function Home() {
  const buttonStyle: React.CSSProperties = {
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
  };

  return (
    <div>
      <NavBar />
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Willkommen bei der Mütter-Community</h1>
        <p>Bitte wähle eine Option:</p>
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <Link href="/login">
            <button style={buttonStyle}>Login</button>
          </Link>
          <Link href="/register">
            <button style={buttonStyle}>Neu registrieren</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

