import React, { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";

/* ===== Assets ===== */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

/* ===== Palette ===== */
const C = {
    sable: "#1b120b",
    taupe: "#5a3317",
    ocre: "#9c541e",
    blanc: "#F9F8F6",
    noir: "#121212",
};

/* ===== Gate qui bloque le scroll (overlay) ===== */
function ScrollGate({ active }: { active: boolean }) {
    if (!active) return null;
    const stop = (e: React.UIEvent | React.WheelEvent | React.TouchEvent) => {
        e.preventDefault?.();
        (e as any).stopPropagation?.();
    };
    return (
        <div
            aria-hidden
            onWheel={stop}
            onTouchMove={stop}
            onScroll={stop as any}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                touchAction: "none",
                overscrollBehavior: "contain",
                background: "transparent",
            }}
        />
    );
}

/* ===== Lettres au scroll (opacité uniquement) ===== */
function ScrollLetters({
    text,
    progress,
    start = 0,
    end = 1,
    delayPerChar = 0.02,
    className = "",
}: {
    text: string;
    progress: MotionValue<number>;
    start?: number;
    end?: number;
    delayPerChar?: number;
    className?: string;
}) {
    const chars = useMemo(() => [...text], [text]);
    return (
        <span className={className} aria-label={text}>
            {chars.map((ch, i) => {
                const iStart = start + i * delayPerChar;
                const iEnd = Math.min(end, iStart + 0.12);
                const o = useTransform(progress, [iStart, iEnd], [0, 1], { clamp: true });
                return (
                    <motion.span key={`${text}-${i}`} style={{ display: "inline-block", opacity: o }}>
                        {ch === " " ? "\u00A0" : ch}
                    </motion.span>
                );
            })}
        </span>
    );
}

/* ===== Page ===== */
export default function Accueil() {
    const coverRef = useRef<HTMLElement | null>(null);
    const { scrollYProgress: p } = useScroll({
        target: coverRef,
        offset: ["start start", "end start"],
    });

    // Feuille blanche recouvre l’image
    const sheetY = useTransform(p, [0, 0.4], ["100%", "0%"]);
    // Titre brand fade-out
    const brandOpacity = useTransform(p, [0, 0.16, 0.28], [1, 1, 0]);

    // Amorce : visibilité et progression
    const hookOpacity = useTransform(p, [0.50, 0.60, 0.965, 0.985], [0, 1, 1, 0], { clamp: true });
    const hookProgress = useTransform(p, [0.58, 0.965], [0, 1], { clamp: true });

    // Séquençage exact des lignes
    const line1 = "Vivez une expérience unique";
    const line2 = "à travers le monde.";
    const L2_START = 0.62;
    const L2_END = 0.96;
    const DELAY = 0.016;
    const WINDOW = 0.12; // durée d'apparition par lettre

    // Calcul : quand la dernière lettre de la ligne 2 atteint l’opacité 1
    const line2Len = useMemo(() => [...line2].length, [line2]);
    const l2LastStart = L2_START + (line2Len - 1) * DELAY;
    const unlockAt = Math.min(L2_END, l2LastStart + WINDOW); // seuil exact de fin de la 2e ligne

    // Scroll lock: actif jusqu’à la fin exacte de la 2e ligne
    const [locked, setLocked] = useState(true);
    useMotionValueEvent(hookProgress, "change", (v) => {
        setLocked(v < unlockAt); // on libère uniquement quand v >= unlockAt
    });

    return (
        <>
            <ScrollGate active={locked} />

            {/* ===== COVER STAGE ===== */}
            <section ref={coverRef as any} className="CoverStage">
                <div className="CoverSticky">
                    <div className="Cover__bg" aria-hidden>
                        <img src={asset("hero.jpg")} alt="" />
                    </div>

                    <motion.h1 className="BrandTitle" style={{ opacity: brandOpacity }}>
                        Âme du Monde
                    </motion.h1>

                    <motion.div className="Cover__sheet" style={{ y: sheetY }} />

                    {/* Accroche FIXE (immobile), ligne 1 puis ligne 2, lettres par lettres */}
                    <motion.div className="Hook" style={{ opacity: hookOpacity }}>
                        <h2 className="Hook__line ocre">
                            <ScrollLetters
                                text={line1}
                                progress={hookProgress}
                                start={0.02}
                                end={0.60}
                                delayPerChar={DELAY}
                            />
                        </h2>
                        <h3 className="Hook__line Hook__line--accent ocre">
                            <ScrollLetters
                                text={line2}
                                progress={hookProgress}
                                start={L2_START}
                                end={L2_END}
                                delayPerChar={DELAY}
                            />
                        </h3>
                    </motion.div>
                </div>
            </section>

            {/* ===== CONTENU (inchangé) ===== */}
            <section className="Section Section--agency">
                <header className="SubTitle">Notre agence</header>
                <div className="Grid2">
                    <div className="Col Col--text Col--textOffset">
                        <p className="Lead Lead--tightRight">
                            Des voyages sur-mesure, conçus pour une expérience unique, alliant authenticité et équilibre subtil.
                            Conçus avec soin, nos itinéraires vous laissent la liberté de savourer pleinement chaque moment.
                        </p>
                    </div>
                    <div className="Col Col--img Col--imgNarrow">
                        <img className="ImgTall" src={asset("1.jpg")} alt="Ambiance — vertical" />
                    </div>
                </div>
            </section>

            <section className="Section Section--tightTop">
                <div className="Grid2 Grid2--rev">
                    <div className="Col Col--img Col--imgWide">
                        <img className="ImgWide" src={asset("2.jpg")} alt="Rencontres — horizontal" />
                    </div>
                    <div className="Col Col--text">
                        <p className="Lead Lead--tightRight">
                            De l’organisation aux rencontres, chaque détail est façonné pour révéler l’authenticité et créer des souvenirs impérissables.
                        </p>
                    </div>
                </div>
            </section>

            <section className="Section">
                <header className="SubTitle">Notre processus</header>
                <ol className="Steps">
                    {[
                        ["01", "Écoute & intention", "On part de vos envies profondes, vos rythmes et vos limites pour cadrer l’essentiel."],
                        ["02", "Conception sur-mesure", "Un itinéraire finement ajusté : équilibre, fluidité, temps pour soi."],
                        ["03", "Orchestration", "Logistique maîtrisée, partenaires triés, détails réglés — pour voyager l’esprit libre."],
                        ["04", "Suivi & délicatesse", "Nous restons présents, avec tact : ajustements, attentions, sérénité jusqu’au retour."],
                    ].map(([n, t, d]) => (
                        <li className="Step" key={n}>
                            <span className="Step__num">{n}</span>
                            <div className="Step__body">
                                <h3 className="Step__title">{t}</h3>
                                <p className="Step__text">{d}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="Section Section--promise">
                <header className="SubTitle">Une promesse</header>
                <div className="Prose Prose--center">
                    <p>
                        Le vrai luxe ne réside pas dans l’accumulation, mais dans la justesse. Nous vous promettons des voyages sobres et raffinés,
                        où chaque détail compte, où chaque moment a sa place. Pas de démesure inutile, seulement la beauté des lieux, la richesse des cultures,
                        et la liberté de n’avoir rien à gérer.
                    </p>
                    <p className="Promise">Notre promesse&nbsp;: vous offrir le privilège de voyager autrement.</p>
                </div>
            </section>

            <section className="WideImageFull" aria-label="Inspiration visuelle">
                <img src={asset("3.jpg")} alt="" />
            </section>

            <section className="Section Section--cta">
                <h2 className="CTA__title CTA__title--ocre">Votre prochaine évasion commence ici</h2>
                <p className="CTA__text">Laissez-nous transformer vos envies en un voyage unique, sculpté selon vos envies.</p>
                <a href="#contact" className="CTA__btn">Commencer l’aventure</a>
            </section>

            <style>{`
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap');

:root{ --c-sable:${C.sable}; --c-taupe:${C.taupe}; --c-ocre:${C.ocre}; --c-blanc:${C.blanc}; --c-noir:${C.noir}; }
*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0; color:var(--c-sable); background:var(--c-blanc);
  font-family: "Source Sans 3", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  font-weight: 300; line-height:1.6;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
h1,h2,h3,.BrandTitle,.Hook__line,.SubTitle{
  font-family:"EB Garamond", Georgia, serif; font-weight: 400; letter-spacing: 0.004em;
}

/* ===== COVER ===== */
.CoverStage{ height: 320vh; position: relative; }
.CoverSticky{ position: sticky; top: 0; min-height: 100vh; isolation: isolate; overflow: hidden; }
.Cover__bg{ position:absolute; inset:0; z-index:-2; }
.Cover__bg img{ width:100%; height:100%; object-fit:cover; object-position:center; display:block; }
.BrandTitle{
  position:absolute; inset:0; display:grid; place-items:center; z-index:0;
  margin:0; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.33);
  letter-spacing:.045em; font-weight:400; font-size:clamp(34px, 6.6vw, 92px);
}
.Cover__sheet{ position:absolute; inset:0; background:var(--c-blanc); z-index:1; will-change:transform; }

/* Accroche FIXE (immobile) */
.Hook{
  position: fixed; inset: 0;
  display: grid; place-items: center;
  z-index: 5; pointer-events: none;
  text-align: center; padding: 2rem;
}
.Hook__line{
  margin:0; font-weight:400; letter-spacing:.002em;
  font-size: clamp(26px, 4.3vw, 56px);
  line-height: 1.08;
}
.Hook__line + .Hook__line{ margin-top:.06rem; }
.Hook__line--accent{ font-weight:400; }
.ocre{ color: var(--c-ocre); }

/* ===== Sections ===== */
.Section{ position:relative; background:var(--c-blanc);
          padding:clamp(48px,8vw,96px) clamp(20px,6vw,80px); }
.Section--tightTop{ padding-top:clamp(28px,5vw,56px); }
.SubTitle{ font-size:clamp(20px,2.3vw,25px); font-weight:500; color: var(--c-ocre); margin-bottom:clamp(12px,2.2vw,18px); }

.Grid2{ display:grid; grid-template-columns:1fr; gap:clamp(18px,3vw,28px); align-items:start; }
@media(min-width:980px){ .Grid2{ grid-template-columns:1.05fr .95fr; gap:clamp(24px,4vw,40px); }
                          .Grid2--rev{ grid-template-columns:.95fr 1.05fr; } }

.Col--text .Lead{ font-size:clamp(16px,1.7vw,19px); color:var(--c-sable); max-width:64ch; }
.Lead--tightRight{ max-width:48ch; line-height:1.52; margin-left:auto; }

.Section--agency .SubTitle{ margin-top:clamp(18px,4vw,60px); }
.Section--agency .Col--textOffset{ margin-top:clamp(12px,4vw,50px); }

.Col--img img{ width:100%; height:auto; display:block; }
.Col--imgNarrow .ImgTall{ width:76%; max-height:78vh; object-fit:cover; margin-left:auto; }
.Col--imgWide{ overflow:hidden; }
.Col--imgWide .ImgWide{ width:130%; max-width:none; transform:translateX(-15%); object-fit:cover; }

.Steps{ list-style:none; margin:0; padding:0; display:grid; gap:18px; }
@media(min-width:880px){ .Steps{ grid-template-columns:repeat(4,1fr); gap:22px; } }
.Step{ background:#fff; border:1px solid rgba(27,18,11,.08); border-radius:10px; padding:18px; min-height:160px;
       display:flex; gap:14px; align-items:flex-start; }
.Step__num{ font-variant-numeric:tabular-nums; font-weight:600; color:var(--c-ocre); min-width:2.6ch; }
.Step__title{ margin:2px 0 6px 0; font-size:16px; color:var(--c-taupe); font-family:"EB Garamond", Georgia, serif; font-weight:400; }
.Step__text{ margin:0; font-size:14.5px; color:#4b3b30; font-weight:300; }

.Section--promise{ text-align:center; }
.Prose{ max-width:72ch; font-size:17px; color:var(--c-sable); margin:0; }
.Prose p{ margin:0 0 1rem 0; }
.Prose--center{ margin:0 auto; }
.Promise{ font-weight:500; color:var(--c-taupe); }

.WideImageFull{ padding:0; margin:0; }
.WideImageFull img{ display:block; width:100%; height:auto; }

.Section--cta{ text-align:center; }
.CTA__title{ margin:0 0 8px 0; font-size:clamp(22px,3.6vw,34px); font-weight:500; color:var(--c-taupe); }
.CTA__title--ocre{ color: var(--c-ocre); }
.CTA__text{ margin:0 auto 22px auto; font-size:16.5px; color:#3e2f25; max-width:62ch; }
.CTA__btn{ display:inline-block; padding:12px 20px; border-radius:999px; background:var(--c-taupe); color:#fff; text-decoration:none;
           transition:transform .2s ease, opacity .2s ease; }
.CTA__btn:hover{ transform:translateY(-1px); }
.CTA__btn:active{ transform:translateY(0); opacity:.92; }
      `}</style>
        </>
    );
}
