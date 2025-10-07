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
const BODY_SIZE = 20;
const bodyText: React.CSSProperties = {
    fontSize: BODY_SIZE,
    lineHeight: 1.8,
    color: C.taupe, // corps en taupe
};
const h3Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: 36,
    marginBottom: 16,
    color: C.ocre, // sous-titres en ocre
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

    // Fenêtre de révélation (lettre par lettre)
    const REVEAL_WINDOW = 0.7;
    const reveal = useTransform<number, number>(
        stage,
        [0, REVEAL_WINDOW],
        [0, 1],
        { clamp: true }
    );

    // Phrase avec espaces “normaux” entre les mots (pour le wrap naturel)
    const phrase = "Vivez une expérience unique à travers le monde.                                  ";

    // On construit un tableau de caractères en intercalant explicitement un espace entre chaque mot.
    // Avantage : les espaces existent comme tokens indépendants (et peuvent rester visibles).
    const chars = useMemo(() => {
        const words = phrase.split(" ");
        const out: string[] = [];
        words.forEach((w, i) => {
            out.push(...w.split(""));       // lettres du mot
            if (i < words.length - 1) out.push(" "); // espace visible entre mots
        });
        return out;
    }, [phrase]);

    const L = chars.length;

    // Compteur de lettres révélées
    const revealedCount: MotionValue<number> = prefersReduced
        ? useMotionValue(L) // pas d’anim si motion réduite
        : useTransform<number, number>(reveal, (p) => {
            const n = Math.round(p * L);
            return n < 0 ? 0 : n > L ? L : n;
        });

    // Quand tout est révélé, on débloque la “post anim”
    const allRevealed = useTransform<number, number>(
        revealedCount,
        (n) => (n >= L ? 1 : 0)
    );
    const postBase = useTransform<number, number>(
        stage,
        [REVEAL_WINDOW, 1],
        [0, 1],
        { clamp: true }
    );

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

    // L’amorce remonte légèrement une fois révélée (effet “cover”)
    const phraseYpx = useTransform(post, [0, 1], [0, -220]);
    const phraseYCss = useTransform(phraseYpx, (v) => `translateY(${v}px)`);

    // Le grand titre “Âme du Monde” s’éteint au début du scroll
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
                {/* léger fade top pour les barres système */}
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
                <motion.div
                    style={{ opacity: titleOpacity, width: "100%", height: "100%" }}
                >
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

                    {/* flèche bas (discrète) */}
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
                            <path
                                d="M12 5v14M5 12l7 7 7-7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </motion.svg>
                    </motion.div>
                </motion.div>
            </div>

            {/* Spacer pour laisser le hero plein écran */}
            <div style={{ height: "100vh", position: "relative", zIndex: 1 }} />

            {/* ===== AMORCE STICKY (peut passer sur 2 lignes) ===== */}
            <section
                ref={stageRef}
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.blanc,
                    color: C.taupe,
                    // hauteur large pour laisser le temps au reveal sans saccades
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
                            // → autorise la coupure en 2 lignes naturellement
                            whiteSpace: "normal",
                            wordBreak: "normal",
                            overflowWrap: "anywhere", // évite les débordements extrêmes sur très petit écran
                            textAlign: "center",
                            // largeur max pour “forcer” 1–2 lignes élégantes selon viewport
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
                            <Letter
                                key={`${ch}-${i}`}
                                index={i}
                                revealedCount={revealedCount}
                                char={ch}
                            />
                        ))}
                    </motion.h2>
                </div>
            </section>

            {/* ===== CONTENU — Notre agence ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 20px 96px" }}>
                    <h3 style={h3Style}>Notre agence</h3>
                    <p style={{ ...bodyText, maxWidth: 780 }}>
                        Des voyages sur-mesure, conçus pour une expérience unique, alliant authenticité et équilibre subtil.
                        Conçus avec soin, nos itinéraires vous laissent la liberté de savourer pleinement chaque moment.
                    </p>

                    <div style={{ marginTop: 80, display: "flex", flexDirection: "column", gap: 80 }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 40,
                                flexWrap: "wrap",
                            }}
                        >
                            <img
                                src={asset("/1.jpg")}
                                alt=""
                                style={{
                                    width: "100%",
                                    maxWidth: 460,
                                    borderRadius: 12,
                                    objectFit: "cover",
                                    aspectRatio: "3 / 4",
                                }}
                                loading="lazy"
                            />
                            <p style={{ ...bodyText, flex: 1 }}>
                                De l’organisation aux rencontres, chaque détail est façonné pour révéler l’authenticité et créer des souvenirs impérissables.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                alignItems: "center",
                                gap: 40,
                                flexWrap: "wrap",
                            }}
                        >
                            <img
                                src={asset("/2.jpg")}
                                alt=""
                                style={{
                                    width: "100%",
                                    maxWidth: 460,
                                    borderRadius: 12,
                                    objectFit: "cover",
                                    aspectRatio: "3 / 4",
                                }}
                                loading="lazy"
                            />
                            <p style={{ ...bodyText, flex: 1 }}>
                                Nos créateurs de voyage imaginent des itinéraires singuliers, inspirés par la beauté du monde et la richesse des cultures.
                            </p>
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
                    padding: "120px 20px",
                    textAlign: "center",
                }}
            >
                <h3 style={{ ...h3Style, color: C.blanc }}>Nos valeurs</h3>
                <p
                    style={{
                        fontSize: BODY_SIZE,
                        lineHeight: 1.8,
                        opacity: 0.95,
                        maxWidth: 700,
                        margin: "0 auto",
                        color: C.blanc,
                    }}
                >
                    Compétence, Engagement, Polyvalence, Créativité et Durabilité — cinq piliers qui guident chacun de nos
                    projets et chaque expérience que nous façonnons.
                </p>
            </section>

            {/* ===== Notre approche ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px 40px" }}>
                    <h3 style={h3Style}>Notre approche</h3>
                    <div style={{ display: "grid", gap: 28, gridTemplateColumns: "1fr", maxWidth: 900 }}>
                        <p style={bodyText}>
                            <strong style={{ color: C.taupe }}>Écoute & co-création&nbsp;:</strong> nous partons de vos envies,
                            de vos contraintes et de votre rythme pour façonner une trame fidèle à votre style de voyage.
                        </p>
                        <p style={bodyText}>
                            <strong style={{ color: C.taupe }}>Sélection exigeante&nbsp;:</strong> hébergements de caractère,
                            expériences rares et partenaires triés sur le volet pour garantir le juste équilibre entre confort et authenticité.
                        </p>
                        <p style={bodyText}>
                            <strong style={{ color: C.taupe }}>Sérénité opérationnelle&nbsp;:</strong> logistique fluide,
                            temps de trajet optimisés et assistance humaine avant, pendant et après le voyage.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 3.jpg plein largeur ===== */}
            <section style={{ position: "relative", zIndex: 2, background: C.blanc }}>
                <img
                    src={asset("/3.jpg")}
                    alt=""
                    style={{
                        width: "100%",
                        height: "min(70vh, 900px)",
                        objectFit: "cover",
                        display: "block",
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
                    padding: "56px 20px 96px",
                }}
            >
                <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
                    <h3 style={h3Style}>Contact</h3>
                    <p style={{ ...bodyText, maxWidth: 760, margin: "0 auto 28px" }}>
                        Envie de donner vie à votre prochain voyage&nbsp;? Parlons-en et dessinons, ensemble, l’itinéraire qui vous ressemble.
                    </p>
                    <a
                        href="/AmeduMonde/#/contact"
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

            {/* ===== JOINT BLANC SOUS LE FOOTER (anti-fuite) ===== */}
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

/* ===== Lettres (révélation progressive, compatible wrap) =====
   IMPORTANT :
   - On NE force PAS l’espace insécable ici, afin d’autoriser la
     césure sur plusieurs lignes naturellement.
   - Chaque caractère est un span ; le wrapping reste possible entre spans.
*/
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
        // espace toujours visible, participe au wrap
        return (
            <span
                aria-hidden
                style={{
                    display: "inline",      // pas inline-block → césure OK
                    opacity: 1,             // toujours visible
                    whiteSpace: "normal",   // espace normal, pas d’NBSP
                }}
            >
                {" "}
            </span>
        );
    }

    const opacity = useTransform<number, number>(
        revealedCount,
        (n) => (index < n ? 1 : 0)
    );

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
