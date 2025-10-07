import React, { useMemo, useRef, useEffect } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValue,
    MotionValue,
} from "framer-motion";

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
const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Typo partagée ===== */
const BODY_SIZE = 22;
const bodyText: React.CSSProperties = {
    fontSize: BODY_SIZE,
    lineHeight: 1.9,
    color: C.taupe,
    margin: "0 0 20px",
};
const h3Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: 36,
    marginBottom: 18,
    color: C.ocre,
};

export default function Accueil() {
    /* ── Règles CSS ciblées (anti-césure mots + 3.jpg mobile plus haut) ── */
    const css = `
  .amorce-title{
    hyphens:none; -webkit-hyphens:none; -ms-hyphens:none;
    overflow-wrap:normal; word-break:keep-all;
  }
  .amorce-title span.word{ white-space:nowrap; } /* jamais de coupure intra-mot */
  @media (max-width: 640px){
    .banner3{ height:min(28vh, 460px) !important; } /* 3.jpg : un poil plus haut en mobile */
  }
  `;

    /* ── Flèche du hero ─────────────────────────────────────────── */
    const { scrollY } = useScroll();
    const arrowOpacity = useTransform<number, number>(scrollY, [0, 100], [1, 0]);

    /* ── Scène d’amorce (sticky + progress) ─────────────────────── */
    const stageRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: stage } = useScroll({
        target: stageRef,
        offset: ["start start", "end start"],
    });

    const REVEAL_WINDOW = 0.7;
    const reveal = useTransform<number, number>(stage, [0, REVEAL_WINDOW], [0, 1], { clamp: true });

    const phrase = "Vivez une expérience unique à travers le monde.";

    // ===== Découpage par mots (empêche toute césure au milieu d’un mot) =====
    const words = useMemo(() => phrase.trim().split(/\s+/), [phrase]);
    const L = useMemo(() => words.join(" ").length, [words]);

    const revealedCount: MotionValue<number> = prefersReduced
        ? useMotionValue(L)
        : useTransform<number, number>(reveal, (p) => {
            const n = Math.round(p * L);
            return n < 0 ? 0 : n > L ? L : n;
        });

    const allRevealed = useTransform<number, number>(revealedCount, (n) => (n >= L ? 1 : 0));
    const postBase = useTransform<number, number>(stage, [REVEAL_WINDOW, 1], [0, 1], { clamp: true });

    const post = useMotionValue(0);
    useEffect(() => {
        const update = () => {
            const a = prefersReduced ? 1 : allRevealed.get();
            const p = postBase.get();
            post.set(a < 1 ? 0 : clamp01(p));
        };
        const ua = allRevealed.on("change", update);
        const up = postBase.on("change", update);
        update();
        return () => {
            ua();
            up();
        };
    }, [allRevealed, postBase, post]);

    const phraseYpx = useTransform(post, [0, 1], [0, -220]);
    const phraseYCss = useTransform(phraseYpx, (v) => `translateY(${v}px)`);
    const titleOpacity = useTransform(stage, [0, 0.02, 0.12], [1, 1, 0]);

    /* ── Scroll vers le haut sur navigation (contact + footer) ───────────────── */
    useEffect(() => {
        const toTop = () => window.scrollTo({ top: 0, behavior: "auto" });
        window.addEventListener("hashchange", toTop, { passive: true });
        window.addEventListener("popstate", toTop, { passive: true });
        return () => {
            window.removeEventListener("hashchange", toTop);
            window.removeEventListener("popstate", toTop);
        };
    }, []);

    return (
        <div style={{ position: "relative", isolation: "isolate" }}>
            <style>{css}</style>

            {/* ===== HERO FIXE ===== */}
            <div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 0,
                    overflow: "hidden",
                    backgroundColor: C.noir,
                }}
            >
                <img
                    src={asset("/hero.jpg")}
                    alt=""
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                    loading="eager"
                    fetchPriority="high"
                    draggable={false}
                />
                <div
                    style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0,
                        height: 80,
                        background: "linear-gradient(to bottom, rgba(27,18,11,0.6), rgba(27,18,11,0))",
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* ===== TITRE + FLÈCHE ===== */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: C.blanc,
                    pointerEvents: "none",
                    textAlign: "center",
                    paddingTop: "38vh",
                }}
            >
                <motion.div style={{ opacity: titleOpacity, width: "100%", height: "100%" }}>
                    <motion.h1
                        initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                        animate={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            letterSpacing: "0.12em",
                            fontSize: "clamp(3.2rem, 9vw, 9rem)",
                            margin: 0,
                            userSelect: "none",
                            paddingInline: "4vw",
                        }}
                    >
                        Âme du Monde
                    </motion.h1>

                    <motion.div
                        style={{
                            position: "absolute",
                            bottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
                            left: "50%",
                            transform: "translateX(-50%)",
                            opacity: arrowOpacity,
                            willChange: "transform, opacity",
                        }}
                    >
                        <motion.svg
                            width="28" height="28" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ stroke: C.blanc, strokeWidth: 1 }}
                            initial={prefersReduced ? false : { y: 0 }}
                            animate={prefersReduced ? { y: 0 } : { y: [0, 8, 0] }}
                            transition={prefersReduced ? undefined : { duration: 2, ease: "easeInOut", repeat: Infinity }}
                        >
                            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                    </motion.div>
                </motion.div>
            </div>

            {/* Spacer plein écran */}
            <div style={{ height: "100vh", position: "relative", zIndex: 1 }} />

            {/* ===== AMORCE STICKY (jamais coupée au milieu d’un mot) ===== */}
            <section
                ref={stageRef}
                style={{ position: "relative", zIndex: 2, background: C.blanc, color: C.taupe, minHeight: "170vh" }}
            >
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        minHeight: "100vh",
                        display: "grid",
                        placeItems: "center",
                        background: C.blanc,
                        paddingInline: "6vw",
                    }}
                >
                    <motion.h2
                        className="amorce-title"
                        aria-label={phrase}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            textAlign: "center",
                            maxWidth: "min(92vw, 980px)",
                            fontSize: "clamp(22px, 6.2vw, 60px)",
                            lineHeight: 1.12,
                            letterSpacing: "0.01em",
                            color: C.taupe,
                            transform: phraseYCss,
                            willChange: "transform",
                        }}
                    >
                        <Words phrase={phrase} revealedCount={revealedCount} />
                    </motion.h2>
                </div>
            </section>

            {/* ===== CONTENU — Notre agence ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 24px 110px" }}>
                    <h3 style={h3Style}>Notre agence</h3>

                    <p style={{ ...bodyText, maxWidth: 820, marginBottom: 28 }}>
                        Des voyages sur-mesure, conçus pour une expérience unique, alliant authenticité et équilibre subtil.
                        Pensés avec soin, nos itinéraires vous laissent la liberté de savourer pleinement chaque moment.
                    </p>

                    <div style={{ marginTop: 90, display: "flex", flexDirection: "column", gap: 90 }}>
                        {/* Bloc 1 */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 44,
                                flexWrap: "wrap",
                            }}
                        >
                            <img
                                src={asset("/1.jpg")}
                                alt=""
                                style={{
                                    width: "100%",
                                    maxWidth: 520,
                                    borderRadius: 0,
                                    objectFit: "cover",
                                    aspectRatio: "3 / 4",
                                    flex: "0 1 480px",
                                }}
                                loading="lazy"
                            />
                            <p style={{ ...bodyText, flex: 1, maxWidth: 720, padding: "0 28px" }}>
                                De l’organisation aux rencontres, chaque détail révèle l’authenticité et compose des souvenirs qui
                                restent.
                            </p>
                        </div>

                        {/* Bloc 2 — Texte étroit à gauche, 2.jpg à droite */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 44,
                                flexWrap: "wrap",
                            }}
                        >
                            <p
                                style={{
                                    ...bodyText,
                                    flex: "0 1 360px",
                                    maxWidth: 420,
                                    padding: "0 12px 0 0",
                                    margin: 0,
                                    order: 0,
                                }}
                            >
                                Nos créateurs de voyage imaginent des itinéraires singuliers, inspirés par la beauté du monde et
                                la richesse des cultures.
                            </p>
                            <img
                                src={asset("/2.jpg")}
                                alt=""
                                style={{
                                    width: "100%",
                                    maxWidth: 900,
                                    flex: "1 1 60%",
                                    borderRadius: 0,
                                    objectFit: "cover",
                                    aspectRatio: "16 / 9",
                                    order: 1,
                                }}
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== VALEURS (fond taupe) ===== */}
            <section
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.taupe,
                    color: C.blanc,
                    padding: "120px 24px",
                    textAlign: "center",
                }}
            >
                <h3 style={{ ...h3Style, color: C.blanc }}>Nos valeurs</h3>
                <p
                    style={{
                        fontSize: BODY_SIZE,
                        lineHeight: 1.9,
                        opacity: 0.95,
                        maxWidth: 820,
                        margin: "0 auto",
                        color: C.blanc,
                    }}
                >
                    Compétence, engagement, polyvalence, créativité et durabilité guident notre manière de concevoir chaque
                    voyage&nbsp;: une exigence sereine, tournée vers l’essentiel.
                </p>
            </section>

            {/* ===== Notre approche — + d'espace bas pour séparer de 3.jpg ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <div style={{ maxWidth: 1180, margin: "0 auto", padding: "84px 24px 96px" }}>
                    <h3 style={h3Style}>Notre approche</h3>

                    <p style={{ ...bodyText, maxWidth: 820, marginBottom: 36 }}>
                        Une méthode discrète et précise&nbsp;: nous co-créons l’itinéraire, choisissons ce qui a du sens et
                        orchestrons chaque détail pour que tout paraisse simple.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: 22,
                            alignItems: "stretch",
                        }}
                    >
                        {[
                            {
                                title: "Écoute & co-création",
                                text:
                                    "Vos envies, votre rythme et vos contraintes dessinent la trame. Ensemble, nous composons un voyage fidèle à votre style.",
                            },
                            {
                                title: "Sélection exigeante",
                                text:
                                    "Maisons de caractère, expériences rares et partenaires choisis avec soin pour allier confort, profondeur et authenticité.",
                            },
                            {
                                title: "Sérénité opérationnelle",
                                text:
                                    "Une logistique fluide, des temps optimisés et une présence attentive avant, pendant et après le voyage.",
                            },
                        ].map((b, i) => (
                            <motion.article
                                key={i}
                                whileHover={{ y: -3 }}
                                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                                style={{
                                    padding: "22px 22px 18px",
                                    background: "#fff",
                                    boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                                    border: `1px solid ${C.taupe}14`,
                                    borderRadius: 16,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 300,
                                        fontSize: 22,
                                        letterSpacing: "0.01em",
                                        color: C.ocre,
                                    }}
                                >
                                    {b.title}
                                </div>
                                <p style={{ ...bodyText, margin: 0 }}>{b.text}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 3.jpg bandeau fin (avec marge-top + hauteur mobile ajustée) ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc, marginTop: 12 }}>
                <img
                    className="banner3"
                    src={asset("/3.jpg")}
                    alt=""
                    style={{
                        width: "100%",
                        height: "clamp(110px, 18vw, 420px)", // desktop identique, mobile override via CSS ci-dessus
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 0,
                    }}
                    loading="lazy"
                />
            </section>

            {/* ===== Espace Contact ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc, padding: "64px 24px 104px" }}>
                <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
                    <h3 style={h3Style}>Contact</h3>
                    <p style={{ ...bodyText, maxWidth: 800, margin: "0 auto 30px" }}>
                        Envie de donner vie à votre prochain voyage&nbsp;? Parlons-en et dessinons, ensemble, l’itinéraire qui
                        vous ressemble.
                    </p>
                    <a
                        href="/AmeduMonde.siteweb/#/contact"
                        onClick={() => {
                            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
                        }}
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
                        Aller à la page contact
                    </a>
                </div>
            </section>

            {/* ===== Joint blanc sous footer (anti-fuite) ===== */}
            <div
                aria-hidden
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.blanc,
                    height: 180,
                    marginBottom: -180,
                }}
            />
        </div>
    );
}

/* ======= Mots + Lettres (révélation), sans césure intra-mot ======= */
function Words({ phrase, revealedCount }: { phrase: string; revealedCount: MotionValue<number> }) {
    const words = phrase.trim().split(/\s+/);

    let cursor = 0;
    const nodes = [];

    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        const start = cursor;

        nodes.push(
            <span key={`w-${w}`} className="word">
                {Array.from(word).map((ch, j) => (
                    <Letter key={`w-${w}-c-${j}`} index={start + j} revealedCount={revealedCount} char={ch} />
                ))}
            </span>
        );

        cursor += word.length;

        if (w < words.length - 1) {
            nodes.push(<Letter key={`space-${w}`} index={cursor} revealedCount={revealedCount} char={" "} />);
            cursor += 1;
        }
    }

    return <>{nodes}</>;
}

function Letter({
    index,
    revealedCount,
    char,
}: {
    index: number;
    revealedCount: MotionValue<number>;
    char: string;
}) {
    const isSpace = char === " ";
    const opacity = useTransform<number, number>(revealedCount, (n) => (index < n ? 1 : 0));

    if (isSpace) {
        return (
            <span aria-hidden style={{ display: "inline", opacity: 1 }}>
                {" "}
            </span>
        );
    }

    return (
        <motion.span
            style={{
                display: "inline",
                opacity,
                willChange: "opacity",
                color: C.taupe,
            }}
        >
            {char}
        </motion.span>
    );
}
