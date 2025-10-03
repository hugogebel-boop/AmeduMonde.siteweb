import React, { useEffect, useState } from "react";
import Accueil from "./pages/Accueil";
import OuPartir from "./pages/OuPartir";
import Contact from "./pages/Contact";
import QuiSommesNous from "./pages/QuiSommesNous";

const C = {
    sable: "#1b120b",  // fond sombre
    taupe: "#5a3317",  // brun chaud
    cuivre: "#9c541e", // accent cuivre
    bleu: "#7c9fb9",   // bleu doux
    blanc: "#F9F8F6",  // blanc cassé
};

type RouteKey = "/" | "/ou-partir" | "/contact" | "/qui-sommes-nous";

function getHashRoute(): RouteKey {
    const h = window.location.hash.replace(/^#/, "") || "/";
    const allowed: RouteKey[] = ["/", "/ou-partir", "/contact", "/qui-sommes-nous"];
    return (allowed.includes(h as RouteKey) ? (h as RouteKey) : "/");
}

export default function App() {
    const [route, setRoute] = useState<RouteKey>(getHashRoute());

    useEffect(() => {
        const onHash = () => setRoute(getHashRoute());
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    return (
        <div className="font-[Cormorant_Garamond]" style={{ background: C.blanc, color: C.taupe }}>
            {/* Bandeau fixe */}
            <header
                style={{
                    position: "fixed",
                    insetInline: 0,
                    top: 0,
                    height: 48,
                    zIndex: 20,
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    background: "rgba(249,248,246,0.7)",
                    borderBottom: `1px solid ${C.taupe}`,
                }}
            >
                <nav
                    style={{
                        maxWidth: 1160,
                        margin: "0 auto",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingInline: 16,
                        gap: 20,
                    }}
                >
                    <a href="#/" style={{ textDecoration: "none", color: C.taupe }}>Accueil</a>
                    <a href="#/ou-partir" style={{ textDecoration: "none", color: C.taupe }}>Où partir</a>
                    <a href="#/qui-sommes-nous" style={{ textDecoration: "none", color: C.taupe }}>Notre agence</a>
                    <a href="#/contact" style={{ textDecoration: "none", color: C.taupe }}>Contact</a>
                </nav>
            </header>

            {/* Décalage pour le bandeau */}
            <div style={{ height: 48 }} />

            {/* Contenu pages */}
            {route === "/" && <Accueil />}
            {route === "/ou-partir" && <OuPartir />}
            {route === "/contact" && <Contact />}
            {route === "/qui-sommes-nous" && <QuiSommesNous />}

            {/* Footer large et bleu */}
            <footer
                style={{
                    background: C.bleu,
                    padding: "80px 0 40px",
                    color: C.blanc,
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    marginTop: 100,
                }}
            >
                <div
                    style={{
                        maxWidth: 1400,
                        margin: "0 auto",
                        padding: "0 40px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 40,
                    }}
                >
                    {/* Colonne logo & intro */}
                    <div>
                        <h3
                            style={{
                                fontFamily: "Cormorant Garamond, serif",
                                fontSize: 28,
                                marginBottom: 16,
                            }}
                        >
                            Âme du Monde
                        </h3>
                        <p style={{ lineHeight: 1.7, fontSize: 15, opacity: 0.9 }}>
                            Voyages sur-mesure, conçus pour une expérience unique, alliant
                            authenticité et raffinement.
                        </p>
                    </div>

                    {/* Colonne navigation */}
                    <div>
                        <h4 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>Navigation</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8 }}>
                            <li><a href="#/" style={{ color: C.blanc, textDecoration: "none" }}>Accueil</a></li>
                            <li><a href="#/ou-partir" style={{ color: C.blanc, textDecoration: "none" }}>Où partir</a></li>
                            <li><a href="#/qui-sommes-nous" style={{ color: C.blanc, textDecoration: "none" }}>Notre agence</a></li>
                            <li><a href="#/contact" style={{ color: C.blanc, textDecoration: "none" }}>Contact</a></li>
                            <li><a href="#/mentions" style={{ color: C.blanc, textDecoration: "none" }}>Mentions légales</a></li>
                        </ul>
                    </div>

                    {/* Colonne contact */}
                    <div>
                        <h4 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>Contact</h4>
                        <p style={{ margin: "6px 0" }}>Lausanne, Suisse</p>
                        <p style={{ margin: "6px 0" }}>contact@amedumonde.com</p>
                        <p style={{ margin: "6px 0" }}>+41 21 123 45 67</p>
                    </div>

                    {/* Colonne réseaux */}
                    <div>
                        <h4 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>Suivez-nous</h4>
                        <p style={{ margin: "6px 0" }}>
                            Retrouvez Âme du Monde sur Instagram, Facebook et LinkedIn pour
                            découvrir nos inspirations de voyage.
                        </p>
                    </div>
                </div>

                {/* Bas de page */}
                <div
                    style={{
                        maxWidth: 1400,
                        margin: "40px auto 0",
                        padding: "20px 40px 0",
                        borderTop: "1px solid rgba(255,255,255,0.3)",
                        textAlign: "center",
                        fontSize: 14,
                        opacity: 0.8,
                    }}
                >
                    © {new Date().getFullYear()} — Âme du Monde. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
