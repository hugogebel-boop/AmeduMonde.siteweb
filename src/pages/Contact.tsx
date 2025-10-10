// src/pages/Contact.tsx
import React, { useState } from "react";

const C = {
    sable: "#1b120b",
    taupe: "#5a3317",
    ocre: "#9c541e",
    blanc: "#F9F8F6",
};

export default function Contact() {
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Merci ! (branche-moi sur ton vrai endpoint/formspree quand tu veux)");
    };

    const fieldBase: React.CSSProperties = {
        width: "100%",
        padding: "clamp(12px, 2.3vw, 14px)",
        borderRadius: 12,
        border: `1px solid ${C.taupe}26`,
        background: "#fff",
        color: C.taupe,
        lineHeight: 1.5,
        fontSize: "clamp(15px, 2.2vw, 17px)",
        outline: "none",
    };

    return (
        <main
            style={{
                maxWidth: "min(92vw, 720px)",
                margin: "0 auto",
                padding: "clamp(36px, 6vw, 84px) clamp(16px,3vw,28px) 96px",
                background: C.blanc,
                color: C.taupe,
            }}
        >
            {/* titre */}
            <h1
                className="no-hyphens"
                style={{
                    margin: 0,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                    fontSize: "clamp(26px, 4.6vw, 36px)",
                    lineHeight: 1.08,
                    color: C.ocre,
                }}
            >
                Nous contacter
            </h1>

            {/* accroche */}
            <p
                style={{
                    marginTop: 12,
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    fontSize: "clamp(15px, 2.3vw, 18px)",
                    lineHeight: 1.85,
                    color: C.taupe,
                    maxWidth: "68ch",
                }}
            >
                Échangeons sur vos envies en toute simplicité.
            </p>

            {/* formulaire */}
            <form
                onSubmit={onSubmit}
                style={{
                    marginTop: 20,
                    display: "grid",
                    gap: "clamp(12px, 2.4vw, 16px)",
                }}
            >
                <input
                    placeholder="Votre nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    style={fieldBase}
                />

                <input
                    placeholder="Votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={fieldBase}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                />

                <textarea
                    placeholder="Votre message"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    rows={6}
                    style={{ ...fieldBase, resize: "vertical", minHeight: 140 }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "12px 20px",
                        borderRadius: 12,
                        border: `1px solid ${C.ocre}`,
                        background: C.ocre,
                        color: "#fff",
                        fontWeight: 500,
                        letterSpacing: ".02em",
                        boxShadow: "0 8px 20px rgba(156,84,30,0.20)",
                        transition: "transform .18s ease, box-shadow .18s ease",
                        width: "fit-content",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                    Envoyer
                </button>
            </form>
        </main>
    );
}
