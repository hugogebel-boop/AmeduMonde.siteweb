import React, { useEffect } from "react";
import { motion } from "framer-motion";

/* ===== Palette ===== */
const C = {
    sable: "#1b120b",
    taupe: "#5a3317",
    ocre: "#9c541e",
    blanc: "#F9F8F6",
    noir: "#121212",
    bleu: "#102A43",
} as const;

/* ===== Utils ===== */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const CONTACT_HREF = "#/contact";
/* ===== Typo partagée ===== */
const BODY_SIZE = 22;
const bodyText: React.CSSProperties = {
    fontSize: BODY_SIZE,
    lineHeight: 1.9,
    color: C.taupe,
    margin: "0 0 20px",
};
const h2Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: 36,
    margin: "0 0 18px",
    color: C.ocre,
};
const h3Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: 26,
    margin: 0,
    color: C.ocre,
};

/* ===== Animations ===== */
const fadeUp = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
    viewport: { once: true, amount: 0.2 },
};

export default function OuPartir() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    const css = `
    html, body, #root { background: ${C.blanc}; }
    .container { max-width: 1180px; margin: 0 auto; padding: 80px 24px 64px; }
    .chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip {
      font-size: 14px; letter-spacing: .02em; color: ${C.ocre};
      border: 1px solid ${C.ocre}; padding: 6px 10px;
    }
    .grid-3 { display: grid; gap: 18px; grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 960px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } }
    .card {
      background: #fff;
      border: 1px solid ${C.taupe}14;
      box-shadow: 0 6px 24px rgba(0,0,0,.06);
      border-radius: 16px;
      padding: 18px 18px 16px;
      transition: transform .18s ease, box-shadow .18s ease;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,.08); }
    .two-col { display: grid; gap: 28px; grid-template-columns: 1.1fr .9fr; }
    @media (max-width: 900px){ .two-col { grid-template-columns: 1fr; } }
  `;

    const CONTACT_HREF = "/contact"; // ou "/AmeduMonde.siteweb/#/contact"

    return (
        <main style={{ position: "relative", isolation: "isolate", background: C.blanc }}>
            <style>{css}</style>

            {/* ── En-tête ───────────────────────────────────────────── */}
            <section className="container" style={{ paddingTop: 100 }}>
                <motion.h1
                    {...fadeUp}
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 300,
                        letterSpacing: "0.02em",
                        fontSize: 44,
                        margin: 0,
                        color: C.ocre,
                    }}
                >
                    Où partir&nbsp;?
                </motion.h1>

                <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} style={{ ...bodyText, maxWidth: 920, marginTop: 18 }}>
                    Il n’y a pas d’endroit parfait ni d’itinéraire imposé. Le voyage commence par une émotion, une saison,
                    une manière d’habiter le temps. Nous concevons votre route partout dans le monde — îles lointaines, capitales
                    vibrantes, contrées sauvages — avec la même exigence d’esthétique, d’authenticité et d’équilibre.
                </motion.p>

                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="chips" style={{ marginTop: 16 }}>
                    {["Méditerranée", "Afrique & déserts", "Amériques", "Asie & temples", "Nord & fjords", "Océanie"].map((t) => (
                        <span key={t} className="chip">{t}</span>
                    ))}
                </motion.div>
            </section>

            {/* ── Votre envie comme point de départ ─────────────────── */}
            <section className="container" style={{ paddingTop: 24 }}>
                <motion.h2 {...fadeUp} style={h2Style}>Votre envie comme point de départ</motion.h2>
                <motion.p
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: 0.05 }}
                    style={{ ...bodyText, maxWidth: 860, marginBottom: 8 }}
                >
                    Plutôt rivage paisible, immersion culturelle, grande traversée, voyage gourmand ou retraite en lodge&nbsp;?
                    Nous composons un itinéraire qui vous ressemble, au bon tempo, en respectant la saison idéale et la juste
                    part entre découvertes et respiration.
                </motion.p>

                <div className="grid-3" style={{ marginTop: 18 }}>
                    {[
                        { t: "Nature & horizons", d: "Volcans, fjords, déserts, forêts primaires et parcs nationaux pour renouer avec l’essentiel." },
                        { t: "Cultures & rencontres", d: "Villes d’art, artisans, traditions, scènes locales : toucher l’âme d’un lieu." },
                        { t: "Mers & îles", d: "Lagons, cabotage élégant, voiliers privés et escales confidentielles." },
                        { t: "Grands voyages", d: "Routes scéniques, trains de légende, étapes choisies — le mouvement comme art." },
                        { t: "Bien-être & lenteur", d: "Ryokans, riads, spas thermaux, lodges isolés : le luxe d’avoir du temps." },
                        { t: "Saveurs & terroirs", d: "Chefs, vignobles, marchés et tables d’exception pour explorer par les goûts." },
                    ].map((c, i) => (
                        <motion.article
                            key={c.t}
                            className="card"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.06 * i }}
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            <div style={h3Style}>{c.t}</div>
                            <p style={{ ...bodyText, margin: "8px 0 0", fontSize: 18, lineHeight: 1.8 }}>{c.d}</p>
                        </motion.article>
                    ))}
                </div>
            </section>

            {/* ── CTA Contact ───────────────────────────────────────── */}
            <section style={{ background: C.taupe, color: C.blanc }}>
                <div className="container" style={{ paddingTop: 72, paddingBottom: 92, textAlign: "center" }}>
                    <motion.h2
                        {...fadeUp}
                        style={{ ...h2Style, color: C.blanc, marginBottom: 8, fontSize: 34 }}
                    >
                        Parlez-nous de votre prochaine évasion
                    </motion.h2>
                    <motion.p
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.05 }}
                        style={{ ...bodyText, margin: "0 auto 22px", maxWidth: 760, color: C.blanc, opacity: 0.95 }}
                    >
                        Racontez-nous vos envies, vos inspirations, ou simplement une idée qui vous traverse.
                        Nous créerons ensemble un voyage qui ne ressemble qu’à vous.
                    </motion.p>

                    <motion.a
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.1 }}
                        href={CONTACT_HREF}
                        onClick={() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }))}
                        style={{
                            display: "inline-block",
                            padding: "14px 22px",
                            borderRadius: 999,
                            background: C.ocre,
                            color: C.blanc,
                            textDecoration: "none",
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                            boxShadow: "0 8px 20px rgba(156,84,30,0.25)",
                            transition: "transform .18s ease, box-shadow .18s ease",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 28px rgba(156,84,30,0.32)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 20px rgba(156,84,30,0.25)";
                        }}
                    >
                        Nous écrire
                    </motion.a>
                </div>
            </section>

            {/* ── Saisons comme boussole (déplacée ici) ───────────────────── */}
            <section className="container" style={{ paddingTop: 96, paddingBottom: 100 }}>
                <div className="two-col">
                    <div>
                        <motion.h2 {...fadeUp} style={h2Style}>Les saisons comme boussole</motion.h2>
                        <motion.p
                            {...fadeUp}
                            transition={{ ...fadeUp.transition, delay: 0.05 }}
                            style={{ ...bodyText, marginTop: 6 }}
                        >
                            Nous aimons voyager en harmonie avec la nature&nbsp;: les saisons inspirent le
                            tempo de chaque projet. Lumières de l’hiver, printemps florissant, été arctique
                            ou automne doré — il existe un moment idéal pour chaque lieu.
                            <br />
                            <br />
                            Et lorsque la météo change, nous réinventons la route, pour préserver la beauté
                            du voyage plutôt que le calendrier.
                        </motion.p>
                    </div>

                    <motion.aside
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.1 }}
                        className="card"
                        style={{ borderRadius: 12 }}
                    >
                        <div style={{ ...h3Style, marginBottom: 10 }}>Exemples de saisons</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: C.taupe, lineHeight: "28px", fontSize: 18 }}>
                            <li>Nord & fjords — juin à septembre</li>
                            <li>Afrique australe — mai à octobre</li>
                            <li>Asie culturelle — selon moussons</li>
                            <li>Méditerranée — avril/mai & septembre/octobre</li>
                        </ul>
                    </motion.aside>
                </div>
            </section>

            {/* ── Joint anti-fuite (comme Accueil) ───────────────────── */}
            <div aria-hidden style={{ background: C.blanc, height: 160, marginBottom: -160 }} />
        </main>
    );
}
