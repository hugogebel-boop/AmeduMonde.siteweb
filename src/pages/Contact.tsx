import React, { useState } from "react";

export default function Contact() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci ! (branche-moi sur ton vrai endpoint/formspree quand tu veux)");
  };

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ margin: 0, fontSize: 36, letterSpacing: "0.02em", color: "#0B0B0B" }}>Nous contacter</h1>
      <p style={{ marginTop: 12, fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 18, lineHeight: "30px", color: "#7E7266" }}>
        Échangeons sur vos envies en toute simplicité.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 20, display: "grid", gap: 16 }}>
        <input placeholder="Votre nom" value={nom} onChange={e => setNom(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E0DBD3" }} />
        <input placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E0DBD3" }} />
        <textarea placeholder="Votre message" value={msg} onChange={e => setMsg(e.target.value)} rows={6} style={{ padding: 12, borderRadius: 10, border: "1px solid #E0DBD3" }} />
        <button type="submit" style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #CFC8BE", background: "white", color: "#0B0B0B" }}>
          Envoyer
        </button>
      </form>
    </main>
  );
}
