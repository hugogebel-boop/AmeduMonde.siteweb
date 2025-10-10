// src/pages/OuPartir.tsx
import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ============== Palette (identique à Accueil) ============== */
const C = {
    sable: "#1b120b",
    taupe: "#5a3317",
    ocre: "#9c541e",
    blanc: "#F9F8F6",
    noir: "#121212",
    bleu: "#102A43",
} as const;

const CONTACT_HREF = "#/contact";

/* ============== Utils ============== */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

/* ============== Typo partagée (fluid) ============== */
const bodyText: React.CSSProperties = {
    fontSize: "clamp(16px, 2.2vw, 20px)",
    lineHeight: 1.85,
    color: C.taupe,
    margin: "0 0 18px",
};
const h2Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "clamp(24px, 3.2vw, 36px)",
    margin: "0 0 14px",
    color: C.ocre,
    letterSpacing: "0.01em",
};

/* ============== Animations ============== */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const baseFade = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
} as const;

export default function OuPartir() {
    const reduce = useReducedMotion();

    useEffect(() => {
        // Arrive toujours en haut de page sur cette vue
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    const css = `
  :root{
    --bg:${C.blanc};
    --fg:${C.taupe};
    --accent:${C.ocre};
    --container: 1200px;
    --space-2xs: 8px; --space-xs: 14px; --space-sm: 22px;
    --space: 56px; --space-lg: 88px; --space-xl: 120px;
    --divider: ${C.taupe}14;
  }
  html, body, #root { background: var(--bg); color: var(--fg); }
  * { box-sizing: border-box; }
  img { display:block; max-width:100%; height:auto; }
  .no-hyphens{ hyphens:none; -webkit-hyphens:none; -ms-hyphens:none; overflow-wrap:normal; word-break:keep-all; }
  .container{ max-width: var(--container); margin-inline:auto; padding-inline: clamp(16px, 3vw, 28px); }
  .section{ position:relative; z-index:2; background:var(--bg); }

  /* Bouton */
  /* Bouton – protège la couleur du label au hover dans tous les contextes */
.btn{
  --btn-bg: var(--accent);
  --btn-fg: #F9F8F6; /* blanc cassé */
  display:inline-block; padding:14px 22px; border-radius:999px;
  background: var(--btn-bg);
  color: var(--btn-fg); -webkit-text-fill-color: var(--btn-fg); /* Safari */
  text-decoration:none; font-weight:500; letter-spacing:.02em;
  box-shadow:0 8px 20px rgba(156,84,30,0.25);
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    background-color .18s ease,
    color .18s ease;
}
.btn:hover,
.btn:focus{
  /* le fond peut bouger, mais la couleur du texte reste verrouillée */
  color: var(--btn-fg) !important;
  -webkit-text-fill-color: var(--btn-fg) !important;
  transform: translateY(-2px);
  box-shadow:0 12px 28px rgba(156,84,30,0.32);
}
.btn:active{
  transform: translateY(0);
  box-shadow:0 8px 20px rgba(156,84,30,0.25);
}
/* Empêche qu'un style global change la couleur d'un enfant (span, svg, etc.) */
.btn *{
  color: inherit !important;
  -webkit-text-fill-color: inherit !important;
}
/* Accessibilité focus visible inchangée */
:where(a, button).btn:focus-visible{
  outline: 3px solid #9c541e; /* C.ocre */
  outline-offset: 3px;
}
  /* Chips saisons */
  .chips{ display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:18px; }
  .chip{
    font-size: clamp(12px, 1.8vw, 14px);
    color: var(--accent); border:1px solid var(--accent);
    padding:6px 11px; border-radius:999px; background:#fff; white-space: nowrap;
  }

  /* Liste 2 colonnes → 1 en mobile */
  .list{ display:grid; grid-template-columns: 1fr 1fr; gap:8px 24px; }
  @media (max-width: 900px){ .list{ grid-template-columns: 1fr; } }
  .row{ display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-top:1px solid var(--divider); }
  .row:first-child{ border-top:none; }
  .row-title{
    font-family:'Cormorant Garamond', serif; font-weight:300; color:${C.ocre};
    font-size: clamp(18px, 2.4vw, 20px); line-height:1.35; margin-top:2px; min-width:210px;
  }

  /* Grille cartes "envies" */
  .grid-cards{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: clamp(16px, 3.2vw, 32px);
  }
  .card{
    background: #fff;
    border: 1px solid ${C.taupe}1A;
    border-radius: 20px;
    padding: clamp(20px, 3vw, 28px);
    box-shadow: 0 4px 18px rgba(0,0,0,0.04);
    display:flex; flex-direction:column; justify-content:space-between;
    transition: box-shadow .2s ease, transform .2s ease;
  }
  .card:hover{ transform: translateY(-4px); box-shadow: 0 8px 26px rgba(0,0,0,0.06); }

  /* Ruban image final */
  .ruban{
    width:100%;
    height: clamp(110px, 18vw, 360px);
    object-fit: cover;
  }
  @media (max-width:640px){
    .ruban{ height: clamp(80px, 16vw, 140px) !important; }
  }

  .seam-white{ background:${C.blanc}; height: clamp(80px, 10vw, 140px); margin-bottom: calc(-1 * clamp(80px, 10vw, 140px)); }
  `;

    const transition = reduce ? { duration: 0 } : { duration: 0.45, ease: EASE };

    return (
        <main style={{ position: "relative", isolation: "isolate", background: C.blanc }}>
            <style>{css}</style>

            {/* ===== En-tête épuré ===== */}
            <section className="section">
                <div className="container" style={{ paddingTop: "clamp(64px, 10vh, 110px)", paddingBottom: 36 }}>
                    <motion.h1
                        {...baseFade}
                        transition={transition}
                        className="no-hyphens"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            letterSpacing: "0.02em",
                            fontSize: "clamp(28px, 4.5vw, 42px)",
                            margin: 0,
                            color: C.ocre,
                            textAlign: "center",
                            lineHeight: 1.08,
                        }}
                    >
                        Où partir&nbsp;?
                    </motion.h1>

                    <motion.p
                        {...baseFade}
                        transition={{ ...transition, delay: reduce ? 0 : 0.05 }}
                        style={{ ...bodyText, maxWidth: "68ch", margin: "14px auto 0", textAlign: "center" }}
                    >
                        Chaque voyage commence par une envie, une lumière, une saison. Nous
                        imaginons un itinéraire clair, équilibré et fidèle à votre style.
                    </motion.p>
                </div>
            </section>

            {/* ===== Vos envies — cellules élégantes ===== */}
            <section className="section" style={{ background: C.blanc }}>
                <div className="container" style={{ padding: "40px 0 80px" }}>
                    <motion.h2
                        {...baseFade}
                        transition={transition}
                        style={{ ...h2Style, textAlign: "center", marginBottom: "clamp(20px, 3vw, 36px)" }}
                    >
                        Votre envie comme point de départ
                    </motion.h2>

                    <div className="grid-cards">
                        {[
                            {
                                t: "Nature et horizons",
                                d: "Fjords, déserts, parcs nationaux, volcans. Retrouver l’essentiel dans de grands paysages.",
                            },
                            {
                                t: "Cultures et rencontres",
                                d: "Villes d’art, ateliers, marchés, traditions vivantes. Entrer dans l’âme d’un lieu.",
                            },
                            {
                                t: "Mers et îles",
                                d: "Lagons, voiliers privés, escales confidentielles. L’eau comme fil conducteur.",
                            },
                            {
                                t: "Grands voyages",
                                d: "Routes scéniques, trains de légende, étapes choisies. Le mouvement comme art de vivre.",
                            },
                            {
                                t: "Bien-être et lenteur",
                                d: "Ryokans, riads, spas thermaux, lodges isolés. Prendre du temps, vraiment.",
                            },
                            {
                                t: "Saveurs et terroirs",
                                d: "Chefs, vignobles, tables d’exception. Découvrir par le goût et les rencontres.",
                            },
                        ].map((x, i) => (
                            <motion.div
                                key={x.t}
                                {...baseFade}
                                transition={{ ...transition, delay: reduce ? 0 : 0.04 * i }}
                                className="card"
                            >
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontWeight: 300,
                                            color: C.ocre,
                                            fontSize: "clamp(20px, 2.6vw, 24px)",
                                            marginBottom: 8,
                                            letterSpacing: "0.01em",
                                        }}
                                    >
                                        {x.t}
                                    </h3>
                                    <p
                                        style={{
                                            ...bodyText,
                                            margin: 0,
                                        }}
                                    >
                                        {x.d}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA minimal ===== */}
            <section className="section" style={{ background: C.taupe, color: C.blanc }}>
                <div className="container" style={{ padding: "64px 0 72px", textAlign: "center" }}>
                    <motion.h2
                        {...baseFade}
                        transition={transition}
                        style={{ ...h2Style, color: C.blanc, marginBottom: 6, fontSize: "clamp(22px, 3vw, 32px)" }}
                    >
                        Parlons de votre prochaine évasion
                    </motion.h2>
                    <motion.p
                        {...baseFade}
                        transition={{ ...transition, delay: reduce ? 0 : 0.05 }}
                        style={{ ...bodyText, margin: "0 auto 18px", maxWidth: "60ch", color: C.blanc, opacity: 0.95 }}
                    >
                        Partagez vos envies et vos contraintes. Nous dessinons une route simple,
                        juste et sur mesure.
                    </motion.p>

                    <motion.a
                        {...baseFade}
                        transition={{ ...transition, delay: reduce ? 0 : 0.1 }}
                        href={CONTACT_HREF}
                        onClick={() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }))}
                        className="btn"
                    >
                        Nous écrire
                    </motion.a>
                </div>
            </section>

            {/* ===== Les saisons + bulles ===== */}
            <section className="section">
                <div className="container" style={{ padding: "56px 0 80px", textAlign: "center" }}>
                    <motion.h2 {...baseFade} transition={transition} style={{ ...h2Style, marginBottom: 12 }}>
                        Les saisons comme boussole
                    </motion.h2>
                    <motion.p
                        {...baseFade}
                        transition={{ ...transition, delay: reduce ? 0 : 0.05 }}
                        style={{ ...bodyText, maxWidth: "68ch", margin: "0 auto" }}
                    >
                        Voyager en accord avec la saison rend tout plus fluide. Nous choisissons le bon moment
                        pour amplifier la beauté du lieu et préserver votre sérénité.
                    </motion.p>

                    <motion.div
                        {...baseFade}
                        transition={{ ...transition, delay: reduce ? 0 : 0.1 }}
                        className="chips"
                    >
                        {[
                            "Nord & fjords · juin à septembre",
                            "Afrique australe · mai à octobre",
                            "Asie culturelle · selon moussons",
                            "Méditerranée · avril–mai & septembre–octobre",
                        ].map((s) => (
                            <span key={s} className="chip">{s}</span>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ===== Ruban image final ===== */}
            <section className="section" aria-label="Bandeau visuel">
                <img src={asset("/3.jpg")} alt="" className="ruban" loading="lazy" />
            </section>

            <div className="seam-white" aria-hidden />
        </main>
    );
}
