// src/pages/Accueil.tsx
import React, { useMemo, useRef, useEffect } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValue,
    MotionValue,
} from "framer-motion";

/* ============== Design Tokens ============== */
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
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============== Typo ============== */
const BODY_SIZE = 18; // plus lisible sur mobile; on fluidifie plus bas
const bodyText: React.CSSProperties = {
    fontSize: "clamp(16px, 2.2vw, 20px)",
    lineHeight: 1.85,
    color: C.taupe,
    margin: "0 0 18px",
};
const h3Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "clamp(24px, 3.2vw, 36px)",
    marginBottom: 16,
    color: C.ocre,
    letterSpacing: "0.01em",
};

/* ============== Page ============== */
export default function Accueil() {
    /* --------- Global CSS (centralisation du style) --------- */
    const css = `
  :root{
    --bg:${C.blanc};
    --fg:${C.taupe};
    --accent:${C.ocre};
    --ink:${C.sable};
    --container: 1200px;
    --space-2xs: 8px; --space-xs: 14px; --space-sm: 22px;
    --space: 56px; --space-lg: 88px; --space-xl: 120px;
  }
  html, body, #root { background: var(--bg); color: var(--fg); }
  * { box-sizing: border-box; }
  img { display:block; max-width:100%; height:auto; }
  .no-hyphens{
    hyphens:none; -webkit-hyphens:none; -ms-hyphens:none;
    overflow-wrap:normal; word-break:keep-all;
  }
  .container{
    max-width: var(--container);
    margin-inline: auto;
    padding-inline: clamp(16px, 3vw, 28px);
  }
  .section{ position:relative; z-index:2; background:var(--bg); }
  .stack{ display:flex; flex-direction:column; gap: var(--space); }
  .stack-sm{ display:flex; flex-direction:column; gap: var(--space-sm); }

  /* ===== Split texte/image : texte STRICTEMENT à gauche sur desktop ===== */
  .split{
    display:grid;
    grid-template-columns: minmax(260px, 440px) 1fr;
    gap: clamp(16px, 4vw, 48px);
    align-items:center;
  }
  .split .txt{ max-width: 44ch; }
  .split .img{ width:100%; height:100%; object-fit:cover; }

  @media (max-width: 960px){
    .split{ grid-template-columns: 1fr; }
    .split .txt{ order:2; }
    .split .img{ order:1; }
  }

  /* ===== Bandeau 3.jpg : ruban fin en mobile ===== */
  .banner3{
    width:100%;
    height: clamp(120px, 18vw, 420px);
    object-fit:cover;
  }
  @media (max-width:640px){
    .banner3{
      height: clamp(80px, 16vw, 150px) !important; /* effet bandeau fin */
    }
  }

  /* Joint blanc opaque anti-fuite */
  .seam-white{ height: clamp(80px, 10vw, 150px); background: var(--bg); }

  /* Anti-bande sombre top du hero si image sombre */
  .hero-top-fade{
    position:absolute; inset:0 0 auto 0; height:80px; pointer-events:none;
    background:linear-gradient(to bottom, rgba(27,18,11,0.55), rgba(27,18,11,0));
  }

  h1,h2,h3{ margin:0; }
  .h3{ font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--accent); }

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
  /* Cards : sans border-radius sur les images, mais arrondis doux sur conteneurs */
  .card{
    background:#fff;
    border:1px solid ${C.taupe}1F;
    box-shadow:0 6px 24px rgba(0,0,0,0.06);
    border-radius: 16px;
  }

  /* Accessibilité focus visible */
  :where(a, button).btn:focus-visible{
    outline: 3px solid ${C.ocre}; outline-offset: 3px;
  }
  `;

    /* --------- Scroll states --------- */
    const { scrollY } = useScroll();
    const arrowOpacity = useTransform<number, number>(scrollY, [0, 100], [1, 0]);

    /* --------- Amorce sticky --------- */
    const stageRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: stage } = useScroll({
        target: stageRef,
        offset: ["start start", "end start"],
    });

    const REVEAL_WINDOW = 0.7;
    const reveal = useTransform<number, number>(stage, [0, REVEAL_WINDOW], [0, 1], { clamp: true });

    // phrase ocre avec tirets “invisibles” (blanc) pour équilibrer la ligne
    const phrase =
        "Vivez une expérience unique à travers le monde.- - - - - - - - - - - - - - - - - - - - - - - -";

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

    /* --------- Scroll to top on hash navigation (Contact, Footer, etc.) --------- */
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

            {/* ========== HERO FIXE ========== */}
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
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                    loading="eager"
                    fetchPriority="high"
                    draggable={false}
                />
                <div className="hero-top-fade" />
            </div>

            {/* ========== TITRE + FLÈCHE ========== */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,
                    display: "grid",
                    placeItems: "center",
                    color: C.blanc,
                    pointerEvents: "none",
                    textAlign: "center",
                    paddingTop: "38vh",
                }}
            >
                <motion.div style={{ opacity: titleOpacity, width: "100%", height: "100%" }}>
                    <motion.h1
                        initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                        className="no-hyphens"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            letterSpacing: "0.12em",
                            fontSize: "clamp(2.6rem, 8vw, 8.6rem)",
                            margin: 0,
                            userSelect: "none",
                            paddingInline: "4vw",
                            lineHeight: 1.04,
                            color: C.blanc,
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
                                    : { duration: 2, ease: [0.45, 0, 0.55, 1], repeat: Infinity }
                            }
                        >
                            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                    </motion.div>
                </motion.div>
            </div>

            {/* Spacer plein écran */}
            <div style={{ height: "100vh", position: "relative", zIndex: 1 }} />

            {/* ========== AMORCE STICKY ========== */}
            <section ref={stageRef} className="section" style={{ minHeight: "170vh" }}>
                <div
                    className="container"
                    style={{
                        position: "sticky",
                        top: 0,
                        minHeight: "100vh",
                        display: "grid",
                        placeItems: "center",
                        background: C.blanc,
                        paddingBlock: "clamp(40px, 6vh, 80px)",
                    }}
                >
                    <motion.h2
                        aria-label={phrase}
                        className="no-hyphens"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            textAlign: "center",
                            maxWidth: "min(92vw, 980px)",
                            fontSize: "clamp(20px, 6.2vw, 56px)",
                            lineHeight: 1.14,
                            letterSpacing: "0.01em",
                            color: C.ocre,
                            transform: phraseYCss,
                            willChange: "transform",
                        }}
                    >
                        <Words phrase={phrase} revealedCount={revealedCount} />
                    </motion.h2>
                </div>
            </section>

            {/* ========== NOTRE AGENCE ========== */}
            <section className="section">
                <div className="container stack" style={{ padding: "64px 0 96px" }}>
                    <h3 className="h3" style={h3Style}>Notre agence</h3>

                    <p style={{ ...bodyText, maxWidth: "65ch", marginBottom: 24 }}>
                        Des voyages sur-mesure, conçus pour une expérience unique, alliant
                        authenticité et équilibre subtil. Pensés avec soin, nos itinéraires
                        vous laissent la liberté de savourer pleinement chaque moment.
                    </p>

                    <div className="stack" style={{ gap: "clamp(40px, 7vw, 90px)" }}>
                        {/* Bloc 1 */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(12, 1fr)",
                                alignItems: "center",
                                gap: "clamp(14px, 3.6vw, 44px)",
                            }}
                        >
                            <img
                                src={asset("/1.jpg")}
                                alt=""
                                style={{
                                    width: "100%",
                                    aspectRatio: "3 / 4",
                                    objectFit: "cover",
                                    gridColumn: "span 5",
                                }}
                                loading="lazy"
                            />
                            <p
                                style={{
                                    ...bodyText,
                                    gridColumn: "span 7",
                                    margin: 0,
                                }}
                            >
                                De l’organisation aux rencontres, chaque détail révèle
                                l’authenticité et compose des souvenirs qui restent.
                            </p>
                        </div>

                        {/* Bloc 2 — texte à gauche, image à droite (strict sur desktop) */}
                        <div className="split">
                            <p className="txt" style={{ ...bodyText, margin: 0 }}>
                                Nos créateurs de voyage imaginent des itinéraires singuliers,
                                inspirés par la beauté du monde et la richesse des cultures.
                            </p>
                            <img
                                className="img"
                                src={asset("/2.jpg")}
                                alt=""
                                style={{ aspectRatio: "16 / 9" }} /* pas de border-radius */
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== VALEURS (fond taupe) ========== */}
            <section className="section" style={{ background: C.taupe, color: C.blanc }}>
                <div className="container" style={{ padding: "96px 0", textAlign: "center" }}>
                    <h3 className="h3" style={{ ...h3Style, color: C.blanc }}>Nos valeurs</h3>
                    <p
                        style={{
                            fontSize: "clamp(16px, 2.2vw, 20px)",
                            lineHeight: 1.9,
                            opacity: 0.95,
                            maxWidth: "70ch",
                            margin: "0 auto",
                            color: C.blanc,
                        }}
                    >
                        Compétence, engagement, polyvalence, créativité et durabilité
                        guident notre manière de concevoir chaque voyage&nbsp;: une exigence
                        sereine, tournée vers l’essentiel.
                    </p>
                </div>
            </section>

            {/* ========== NOTRE APPROCHE ========== */}
            <section className="section">
                <div className="container" style={{ padding: "72px 0 88px" }}>
                    <h3 className="h3" style={h3Style}>Notre approche</h3>

                    <p style={{ ...bodyText, maxWidth: "65ch", marginBottom: 28 }}>
                        Une méthode discrète et précise&nbsp;: nous co-créons l’itinéraire,
                        choisissons ce qui a du sens et orchestrons chaque détail pour que
                        tout paraisse simple.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "clamp(14px, 2.2vw, 22px)",
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
                                whileHover={prefersReduced ? undefined : { y: -3 }}
                                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                                className="card"
                                style={{
                                    padding: "22px 22px 18px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 300,
                                        fontSize: "clamp(20px, 2.4vw, 22px)",
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

            {/* ===== Joint blanc opaque entre approche et 3.jpg ===== */}
            <div
                className="seam-white"
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.blanc,          // fond blanc pur
                    opacity: 1,                   // aucune transparence
                    height: 150,                  // garde la même hauteur
                }}
            />

            {/* ========== 3.jpg bandeau ========== */}
            <section className="section" aria-label="Bandeau visuel">
                <img className="banner3" src={asset("/3.jpg")} alt="" loading="lazy" />
            </section>

            {/* ========== CONTACT ========== */}
            <section className="section">
                <div className="container" style={{ padding: "56px 0 100px", textAlign: "center" }}>
                    <h3 className="h3" style={h3Style}>Contact</h3>
                    <p style={{ ...bodyText, maxWidth: "68ch", margin: "0 auto 26px" }}>
                        Envie de donner vie à votre prochain voyage&nbsp;? Parlons-en et
                        dessinons, ensemble, l’itinéraire qui vous ressemble.
                    </p>

                    <a
                        href={CONTACT_HREF}
                        onClick={() => {
                            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
                        }}
                        className="btn"
                    >
                        Aller à la page contact
                    </a>
                </div>
            </section>

            {/* espace sous footer (assure un fond blanc si footer overlay) */}
            <div
                aria-hidden
                style={{
                    position: "relative",
                    zIndex: 2,
                    background: C.blanc,
                    height: 160,
                    marginBottom: -160,
                }}
            />
        </div>
    );
}

/* ============== Révélation mot-à-mot ============== */
function Words({
    phrase,
    revealedCount,
}: {
    phrase: string;
    revealedCount: MotionValue<number>;
}) {
    const words = phrase.trim().split(/\s+/);

    let cursor = 0;
    const nodes: React.ReactNode[] = [];

    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        const start = cursor;

        nodes.push(
            <span key={`w-${w}`} className="no-hyphens" style={{ whiteSpace: "nowrap" }}>
                {Array.from(word).map((ch, j) => (
                    <Letter key={`w-${w}-c-${j}`} index={start + j} revealedCount={revealedCount} char={ch} />
                ))}
            </span>
        );

        cursor += word.length;

        if (w < words.length - 1) {
            nodes.push(
                <Letter key={`space-${w}`} index={cursor} revealedCount={revealedCount} char={" "} />
            );
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
    const isHyphen = char === "-" || char === "–" || char === "—";
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
                color: isHyphen ? C.blanc : C.ocre, // tirets “invisibles”
            }}
        >
            {char}
        </motion.span>
    );
}
