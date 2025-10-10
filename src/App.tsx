// src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Accueil from "./pages/Accueil";
import OuPartir from "./pages/OuPartir";
import Contact from "./pages/Contact";

/* ====== Design tokens ====== */
const C = {
    sable: "#1b120b",
    taupe: "#5a3317",
    ocre: "#9c541e",
    blanc: "#F9F8F6",
    noir: "#121212",
    bleu: "#7c9fb9", // bleu du footer
} as const;

type RouteKey = "/" | "/ou-partir" | "/contact" | "/mentions";

/* ====== Routing util ====== */
function getHashRoute(): RouteKey {
    const h = window.location.hash.replace(/^#/, "") || "/";
    const allowed: RouteKey[] = ["/", "/ou-partir", "/contact", "/mentions"];
    return allowed.includes(h as RouteKey) ? (h as RouteKey) : "/";
}

/* ====== Page Mentions (simple) ====== */
function Mentions() {
    return (
        <main className="container" style={{ padding: "84px 0 120px" }}>
            <h1
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    color: C.ocre,
                    fontSize: "clamp(28px,4.5vw,42px)",
                    margin: 0,
                    lineHeight: 1.08,
                }}
            >
                Mentions légales
            </h1>
            <p
                style={{
                    marginTop: 12,
                    lineHeight: 1.85,
                    fontSize: "clamp(16px,2.1vw,19px)",
                    color: C.taupe,
                    maxWidth: "75ch",
                }}
            >
                Ce site est édité par Âme du Monde. Les contenus, textes et visuels sont
                protégés. Pour toute question, veuillez nous contacter.
            </p>
        </main>
    );
}

/* Petit helper classes */
const cx = (...c: Array<string | false | null | undefined>) =>
    c.filter(Boolean).join(" ");

export default function App() {
    const [route, setRoute] = useState<RouteKey>(getHashRoute());
    const [menuOpen, setMenuOpen] = useState(false);

    // détecte desktop (>=1024px)
    const [isDesktop, setIsDesktop] = useState<boolean>(
        typeof window !== "undefined"
            ? window.matchMedia("(min-width: 1024px)").matches
            : false
    );
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        setIsDesktop(mq.matches);
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    // mesure de la hauteur naturelle du menu mobile (pour l’animation + spacer)
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuNaturalH, setMenuNaturalH] = useState(0);

    useEffect(() => {
        const measure = () => {
            if (menuRef.current) setMenuNaturalH(menuRef.current.scrollHeight);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    useEffect(() => {
        if (menuRef.current) setMenuNaturalH(menuRef.current.scrollHeight);
    }, [menuOpen, route]);

    /* ====== Navigation util ====== */
    const go = (href: RouteKey) => {
        if (location.hash.replace(/^#/, "") !== href) location.hash = href;
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
        setMenuOpen(false);
    };

    useEffect(() => {
        const onHash = () => setRoute(getHashRoute());
        window.addEventListener("hashchange", onHash, { passive: true });
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    /* ====== Styles header ====== */
    const headerHeight = 56;

    const linkStyle = (active: boolean): React.CSSProperties => ({
        textDecoration: "none",
        color: C.taupe,
        padding: "10px 12px",
        borderRadius: 999,
        fontSize: 16,
        lineHeight: 1,
        letterSpacing: ".01em",
        background: active ? `${C.ocre}14` : "transparent",
        border: active ? `1px solid ${C.ocre}33` : "1px solid transparent",
        transition: "background .18s ease, color .18s ease, border-color .18s ease",
    });

    const NavLink = ({
        to,
        children,
    }: {
        to: RouteKey;
        children: React.ReactNode;
    }) => (
        <a
            href={`#${to}`}
            onClick={(e) => {
                e.preventDefault();
                go(to);
            }}
            style={linkStyle(route === to)}
            className="nav-link"
        >
            {children}
        </a>
    );

    return (
        <div
            className="font-[Cormorant_Garamond]"
            style={{ background: C.blanc, color: C.taupe, minHeight: "100dvh" }}
        >
            {/* ─── Header (sticky, ne rétrécit pas) ─────────────────────────── */}
            <header className="app-header" role="banner" aria-label="En-tête principal">
                <nav
                    aria-label="Navigation principale"
                    className="container"
                    style={{
                        height: "100%",
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        columnGap: 12,
                    }}
                >
                    {/* Logo + hamburger (mobile) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {!isDesktop && (
                            <button
                                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                                aria-expanded={menuOpen}
                                aria-controls="mobile-drawer"
                                onClick={() => setMenuOpen((v) => !v)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    border: "1px solid transparent",
                                    background: "transparent",
                                    cursor: "pointer",
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d={
                                            menuOpen
                                                ? "M6 6l12 12M18 6L6 18"
                                                : "M4 7h16M4 12h16M4 17h16"
                                        }
                                        stroke={C.taupe}
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        )}

                        <a
                            href="#/"
                            onClick={(e) => {
                                e.preventDefault();
                                go("/");
                            }}
                            style={{
                                textDecoration: "none",
                                color: C.taupe,
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 300,
                                fontSize: "clamp(18px,2.4vw,22px)",
                                letterSpacing: ".04em",
                            }}
                        >
                            Âme du Monde
                        </a>
                    </div>

                    {/* Nav desktop */}
                    {isDesktop ? (
                        <div
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                gap: 8,
                            }}
                        >
                            <NavLink to="/">Accueil</NavLink>
                            <NavLink to="/ou-partir">Où partir</NavLink>
                            <NavLink to="/contact">Contact</NavLink>
                        </div>
                    ) : (
                        <div />
                    )}

                    {/* Espace à droite (placeholder actions) */}
                    <div />
                </nav>

                {/* Menu mobile qui descend sous la barre et pousse le contenu */}
                {!isDesktop && (
                    <div
                        id="mobile-drawer"
                        aria-hidden={!menuOpen}
                        className="nav-drawer"
                        style={{
                            maxHeight: menuOpen ? menuNaturalH : 0,
                            overflow: "hidden",
                            transition: "max-height .28s ease",
                        }}
                    >
                        <div
                            ref={menuRef}
                            className="container"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                padding: "12px 0 16px",
                            }}
                        >
                            <NavLink to="/">Accueil</NavLink>
                            <NavLink to="/ou-partir">Où partir</NavLink>
                            <NavLink to="/contact">Contact</NavLink>
                        </div>
                    </div>
                )}
            </header>

            {/* Spacer: hauteur de la barre + (hauteur du tiroir si ouvert) */}
            <div
                style={{
                    height: headerHeight + (!isDesktop && menuOpen ? menuNaturalH : 0),
                }}
            />

            {/* ─── Pages ───────────────────────────── */}
            {route === "/" && <Accueil />}
            {route === "/ou-partir" && <OuPartir />}
            {route === "/contact" && <Contact />}
            {route === "/mentions" && <Mentions />}

            {/* ─── Footer ─────────────────────────── */}
            <footer
                role="contentinfo"
                style={{
                    background: C.bleu,
                    padding: "80px 0 40px",
                    color: C.blanc,
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    marginTop: 100,
                    position: "relative",
                    zIndex: 30,
                }}
            >
                <div
                    className="container"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 40,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontFamily: "Cormorant Garamond, serif",
                                fontSize: 28,
                                marginBottom: 16,
                                fontWeight: 300,
                                color: C.blanc,
                            }}
                        >
                            Âme du Monde
                        </h3>
                        <p style={{ lineHeight: 1.8, fontSize: 15, opacity: 0.9, margin: 0 }}>
                            Voyages sur-mesure, conçus pour une expérience unique,
                            alliant authenticité et raffinement.
                        </p>
                    </div>

                    <div>
                        <h4
                            style={{ fontSize: 18, marginBottom: 12, fontWeight: 600, color: C.blanc }}
                        >
                            Navigation
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.9 }}>
                            {[
                                { label: "Accueil", to: "/" as RouteKey },
                                { label: "Où partir", to: "/ou-partir" as RouteKey },
                                { label: "Contact", to: "/contact" as RouteKey },
                                { label: "Mentions légales", to: "/mentions" as RouteKey },
                            ].map((l) => (
                                <li key={l.to}>
                                    <a
                                        href={`#${l.to}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            go(l.to);
                                        }}
                                        style={{ color: C.blanc, textDecoration: "none" }}
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4
                            style={{ fontSize: 18, marginBottom: 12, fontWeight: 600, color: C.blanc }}
                        >
                            Contact
                        </h4>
                        <p style={{ margin: "6px 0" }}>Lausanne, Suisse</p>
                        <p style={{ margin: "6px 0" }}>
                            <a href="mailto:contact@amedumonde.com" style={{ color: C.blanc, textDecoration: "none" }}>
                                contact@amedumonde.com
                            </a>
                        </p>
                        <p style={{ margin: "6px 0" }}>
                            <a href="tel:+41211234567" style={{ color: C.blanc, textDecoration: "none" }}>
                                +41 21 123 45 67
                            </a>
                        </p>
                    </div>

                    <div>
                        <h4
                            style={{ fontSize: 18, marginBottom: 12, fontWeight: 600, color: C.blanc }}
                        >
                            Suivez-nous
                        </h4>
                        <p style={{ margin: "6px 0" }}>
                            Retrouvez Âme du Monde sur Instagram, Facebook et LinkedIn
                            pour découvrir nos inspirations de voyage.
                        </p>
                    </div>
                </div>

                <div
                    className="container"
                    style={{
                        marginTop: 40,
                        paddingTop: 20,
                        borderTop: "1px solid rgba(255,255,255,0.3)",
                        textAlign: "center",
                        fontSize: 14,
                        opacity: 0.85,
                    }}
                >
                    © {new Date().getFullYear()} — Âme du Monde. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
