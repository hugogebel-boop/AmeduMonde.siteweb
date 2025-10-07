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

    const phrase = "Vivez une expérience unique à travers le monde.                                  ";

    const chars = useMemo(() => {
        const words = phrase.split(" ");
        const out: string[] = [];
        words.forEach((w, i) => {
            out.push(...w.split(""));
            if (i < words.length - 1) out.push(" "); // espace visible entre mots
        });
        return out;
    }, [phrase]);

    const L = chars.length;

    const revealedCount: MotionValue<number> = prefersReduced
        ? useMotionValue(L)
        : useTransform<number, number>(reveal, (p) => {
            const n = Math.round(p * L);
            return n < 0 ? 0 : n > L ? L : n;
        });

    const allRevealed = useTransform<number, number>(revealedCount, (n) => (n >= L ? 1 : 0));
    const postBase = useTransform<number, number>(stage, [REVEAL_WINDOW, 1], [0, 1], {
        clamp: true,
    });

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

    return (
        <div style={{ position: "relative", isolation: "isolate" }}>
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
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 80,
                        background:
                            "linear-gradient(to bottom, rgba(27,18,11,0.6), rgba(27,18,11,0))",
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
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ stroke: C.blanc, strokeWidth: 1 }}
                            initial={prefersReduced ? false : { y: 0 }}
                            animate={prefersReduced ? { y: 0 } : { y: [0, 8, 0] }}
                            transition={
                                prefersReduced
                                    ? undefined
                                    : { duration: 2, ease: "easeInOut", repeat: Infinity }
                            }
                        >
                            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                    </motion.div>
                </motion.div>
            </div>

            {/* Spacer plein écran */}
            <div style={{ height: "100vh", position: "relative", zIndex: 1 }} />

            {/* ===== AMORCE STICKY ===== */}
            <section
                ref={stageRef}
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.blanc,
                    color: C.taupe,
                    minHeight: "170vh",
                }}
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
                        aria-label={phrase}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            whiteSpace: "normal",
                            wordBreak: "normal",
                            overflowWrap: "anywhere",
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
                        {chars.map((ch, i) => (
                            <Letter key={`${ch}-${i}`} index={i} revealedCount={revealedCount} char={ch} />
                        ))}
                    </motion.h2>
                </div>
            </section>

            {/* ===== CONTENU — Notre agence ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <div
                    style={{
                        maxWidth: 1180,
                        margin: "0 auto",
                        padding: "72px 24px 110px",
                    }}
                >
                    <h3 style={h3Style}>Notre agence</h3>

                    <p style={{ ...bodyText, maxWidth: 820, marginBottom: 28 }}>
                        Des voyages sur-mesure, conçus pour une expérience unique, alliant authenticité et
                        équilibre subtil. Conçus avec soin, nos itinéraires vous laissent la liberté de
                        savourer pleinement chaque moment.
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
                                    borderRadius: 0, // ⛔ pas de coins arrondis
                                    objectFit: "cover",
                                    aspectRatio: "3 / 4",
                                    flex: "0 1 480px",
                                }}
                                loading="lazy"
                            />
                            <p
                                style={{
                                    ...bodyText,
                                    flex: 1,
                                    maxWidth: 720,
                                    padding: "0 28px",
                                }}
                            >
                                De l’organisation aux rencontres, chaque détail est façonné pour révéler
                                l’authenticité et créer des souvenirs impérissables.
                            </p>
                        </div>

                        {/* Bloc 2 — Texte à gauche, 2.jpg à droite (jamais en dessous sur desktop) */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row", // ✅ texte à gauche, image à droite
                                alignItems: "center",
                                gap: 44,
                                flexWrap: "wrap",
                            }}
                        >
                            <p
                                style={{
                                    ...bodyText,
                                    flex: "1 1 340px",
                                    maxWidth: 720,
                                    padding: "0 28px",
                                    order: 0,
                                }}
                            >
                                Nos créateurs de voyage imaginent des itinéraires singuliers, inspirés par la
                                beauté du monde et la richesse des cultures.
                            </p>
                            <img
                                src={asset("/2.jpg")}
                                alt=""
                                style={{
                                    width: "100%",
                                    maxWidth: 900,
                                    flex: "1 1 60%",
                                    borderRadius: 0, // ⛔ pas de coins arrondis
                                    objectFit: "cover",
                                    aspectRatio: "4 / 3",
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
                    Compétence, engagement, polyvalence, créativité et durabilité guident notre manière de
                    concevoir chaque voyage : une exigence sereine, tournée vers l’essentiel et faite pour durer.
                </p>
            </section>

            {/* ===== Notre approche (nouveau design) ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <div style={{ maxWidth: 1180, margin: "0 auto", padding: "84px 24px 44px" }}>
                    <h3 style={h3Style}>Notre approche</h3>

                    {/* Intro courte et élégante */}
                    <p style={{ ...bodyText, maxWidth: 820, marginBottom: 36 }}>
                        Une méthode claire, discrète et attentive : nous co-créons avec vous, choisissons avec soin,
                        et orchestrons l’ensemble pour que tout paraisse simple.
                    </p>

                    {/* Grid de 3 cartes minimalistes */}
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
                                    "Vos envies, votre rythme et vos contraintes forment la trame. Nous dessinons ensemble un itinéraire fidèle à votre style.",
                            },
                            {
                                title: "Sélection exigeante",
                                text:
                                    "Maisons de caractère, expériences rares et partenaires choisis avec précision pour conjuguer confort et authenticité.",
                            },
                            {
                                title: "Sérénité opérationnelle",
                                text:
                                    "Logistique fluide, temps optimisés et présence humaine avant, pendant et après—pour voyager l’esprit libre.",
                            },
                        ].map((b, i) => (
                            <motion.article
                                key={i}
                                whileHover={{ y: -3 }}
                                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                                style={{
                                    borderTop: `1px solid ${C.taupe}22`,
                                    padding: "22px 22px 18px",
                                    background: "#fff",
                                    boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 300,
                                        fontSize: 22,
                                        letterSpacing: "0.01em",
                                        color: C.sable,
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

            {/* ===== 3.jpg bandeau (fin sur mobile) ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <img
                    src={asset("/3.jpg")}
                    alt=""
                    style={{
                        width: "100%",
                        /* Bandeau fin en hauteur sur mobile, plus immersif sur grand écran */
                        height: "clamp(90px, 18vw, 420px)",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 0, // ⛔ pas de coins arrondis
                    }}
                    loading="lazy"
                />
            </section>

            {/* ===== Espace Contact ===== */}
            <section
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.blanc,
                    padding: "64px 24px 104px",
                }}
            >
                <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
                    <h3 style={h3Style}>Contact</h3>
                    <p style={{ ...bodyText, maxWidth: 800, margin: "0 auto 30px" }}>
                        Envie de donner vie à votre prochain voyage&nbsp;? Parlons-en et dessinons, ensemble,
                        l’itinéraire qui vous ressemble.
                    </p>
                    <a
                        href="/AmeduMonde.siteweb/#/contact"
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
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                                "0 12px 28px rgba(156,84,30,0.32)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                                "0 8px 20px rgba(156,84,30,0.25)";
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

/* ===== Lettres (révélation progressive, compatible wrap) ===== */
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

    if (isSpace) {
        return (
            <span
                aria-hidden
                style={{
                    display: "inline",
                    opacity: 1,
                    whiteSpace: "normal",
                }}
            >
                {" "}
            </span>
        );
    }

    const opacity = useTransform<number, number>(revealedCount, (n) => (index < n ? 1 : 0));

    return (
        <motion.span
            style={{
                display: "inline-block",
                opacity,
                willChange: "opacity",
                color: C.taupe,
            }}
        >
            {char}
        </motion.span>
    );
}
