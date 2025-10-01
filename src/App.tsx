import React, { useEffect, useState } from "react";
import Accueil from "./pages/Accueil";
import OuPartir from "./pages/OuPartir";
import Contact from "./pages/Contact";
import QuiSommesNous from "./pages/QuiSommesNous";

const C = {
  sable: "#EAD9B5",
  taupe: "#7E7266",
  blanc: "#F9F8F6",
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
      {/* BANDEAU ULTRA-FIN (logo non demandé, on met une nav texte propre) */}
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
            borderBottom: `1px solid ${C.sable}`,
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

      {/* Décalage pour ne pas passer sous le bandeau */}
      <div style={{ height: 48 }} />

      {/* CONTENU PAR PAGE */}
      {route === "/" && <Accueil />}
      {route === "/ou-partir" && <OuPartir />}
      {route === "/contact" && <Contact />}
      {route === "/qui-sommes-nous" && <QuiSommesNous />}

      {/* FOOTER (même fond + même écriture/couleur que le texte) */}
      <footer
        style={{
          background: C.blanc,
          padding: "28px 0",
          borderTop: `1px solid ${C.sable}`,
          color: C.taupe,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 15,
          marginTop: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>© {new Date().getFullYear()} — Âme du Monde</span>
          <a href="#/mentions" style={{ color: C.taupe, textDecoration: "none" }}>Mentions légales</a>
        </div>
      </footer>
    </div>
  );
}
