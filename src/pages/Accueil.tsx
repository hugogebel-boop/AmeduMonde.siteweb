import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

// tout en haut de Accueil.tsx (ou dans un utils.ts que tu importes)
const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, '')}`;

/** Palette mise à jour
 * - blanc inchangé (#F9F8F6)
 * - toute référence à "taupe" ou "ocre" => #5a3317
 * - autres nouvelles teintes disponibles pour la suite
 */
const C = {
    sable: '#1b120b',   // nouveau foncé
    taupe: '#5a3317',   // remplace taupe -> #5a3317
    ocre: '#5a3317',   // remplace ocre  -> #5a3317
    blanc: '#F9F8F6',   // inchangé
    bleu: '#7c9fb9',   // nouveau bleu doux
    noir: '#121212',   // garde un noir technique si besoin
    cuivre: '#9c541e',   // dispo si tu veux un accent chaud
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }

/** Progress local basé sur viewport (meilleure précision pour sticky) */
function useViewportProgress(sectionRef: React.RefObject<HTMLElement>, stickyPx: number) {
    const [p, setP] = useState(0) // 0 → 1 pendant la piste utile
    useEffect(() => {
        let raf = 0
        const onScroll = () => {
            const el = sectionRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const total = Math.max(1, rect.height - stickyPx) // piste utile
            const advanced = Math.min(total, Math.max(0, -rect.top))
            setP(advanced / total)
        }
        const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll) }
        tick()
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('scroll', tick)
            window.removeEventListener('resize', tick)
        }
    }, [sectionRef, stickyPx])
    return p
}

function useVH() {
    const [vh, setVh] = useState(0)
    useEffect(() => {
        const u = () => setVh(window.innerHeight)
        u()
        window.addEventListener('resize', u)
        return () => window.removeEventListener('resize', u)
    }, [])
    return vh
}

function useHeroProgress(heroH: number) {
    const [p, setP] = useState(0)
    useEffect(() => {
        const on = () => setP(clamp01(window.scrollY / Math.max(1, heroH)))
        on()
        window.addEventListener('scroll', on, { passive: true })
        return () => window.removeEventListener('scroll', on)
    }, [heroH])
    return p
}

function useScrollY() {
    const [y, setY] = useState(0)
    useEffect(() => {
        const on = () => setY(window.scrollY)
        on()
        window.addEventListener('scroll', on, { passive: true })
        return () => window.removeEventListener('scroll', on)
    }, [])
    return y
}

/** Progress local 0→1 à l’intérieur d’une section (spanPx = longueur de piste utile) */
function useLocalProgress(sectionRef: React.RefObject<HTMLElement>, spanPx: number) {
    const [p, setP] = useState(0)
    useEffect(() => {
        const on = () => {
            const el = sectionRef.current
            if (!el) return
            const startY = el.offsetTop
            const y = window.scrollY
            const raw = (y - startY) / Math.max(1, spanPx)
            setP(clamp01(raw))
        }
        on()
        window.addEventListener('scroll', on, { passive: true })
        window.addEventListener('resize', on)
        return () => {
            window.removeEventListener('scroll', on)
            window.removeEventListener('resize', on)
        }
    }, [sectionRef, spanPx])
    return p
}

/* ===========================
   StickyBandInverse (avec handoffAdvancePx)
   =========================== */
function StickyBandInverse({
    title = 'Une approche unique<br/>pour vos voyages',
    bandColor = C.taupe,
    textColor = C.blanc,
    heightVH = 100,
    durationVH = 250,
    hideTitleWhenCovered = true,
    handoffAdvancePx = 0,
}: {
    title?: string
    bandColor?: string
    textColor?: string
    heightVH?: number
    durationVH?: number
    hideTitleWhenCovered?: boolean
    handoffAdvancePx?: number
}) {
    const vh = useVH()
    const stickyH = Math.round((vh * heightVH) / 100)
    const trackH = Math.round((vh * durationVH) / 100)

    const sectionRef = useRef<HTMLElement | null>(null)
    const [p, setP] = useState(0)
    const [inPin, setInPin] = useState(false)

    useEffect(() => {
        let raf = 0
        const onScroll = () => {
            const el = sectionRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const total = Math.max(1, rect.height - stickyH)
            const advanced = Math.min(total, Math.max(0, -rect.top))
            const prog = advanced / total
            setP(prog)
            setInPin(rect.top <= 0 && rect.bottom >= stickyH)
        }
        const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll) }
        tick()
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick)
        return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick) }
    }, [stickyH])

    const split = 0.5
    const reveal = clamp01(p / split)
    const coverBase = clamp01((p - split) / (1 - split))

    const topMaskPct = Math.round((1 - reveal) * 100)

    const advanceRel = clamp01(handoffAdvancePx / Math.max(1, stickyH))
    const coverAdvanced = clamp01(coverBase + advanceRel)
    const bottomMaskPct = Math.round(coverAdvanced * 100)
    const bottomMaskZ = hideTitleWhenCovered ? 3 : 1

    const fixedLayer: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: stickyH,
        overflow: 'hidden',
        zIndex: 10,
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
    }

    return (
        <section
            ref={sectionRef as any}
            style={{ height: trackH, position: 'relative', background: 'transparent', margin: 0 }}
        >
            {inPin && (
                <div style={fixedLayer}>
                    <div style={{ position: 'absolute', inset: 0, background: bandColor, zIndex: 0 }} />
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute', left: 0, right: 0, top: 0,
                            height: `${topMaskPct}%`,
                            background: C.blanc,
                            zIndex: 1,
                            willChange: 'height',
                            transition: 'height 0.03s linear',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute', inset: 0,
                            display: 'grid', placeItems: 'center',
                            zIndex: 2, pointerEvents: 'none',
                            color: textColor,
                        }}
                    >
                        <h2
                            className="m-0"
                            style={{
                                fontSize: 'clamp(40px,6vw,72px)',
                                lineHeight: 1.15,
                                fontWeight: 700,
                                letterSpacing: '-0.01em',
                                textAlign: 'center',
                            }}
                            dangerouslySetInnerHTML={{ __html: title }}
                        />
                    </div>
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute', left: 0, right: 0, bottom: 0,
                            height: `${bottomMaskPct}%`,
                            background: C.blanc,
                            zIndex: bottomMaskZ,
                            willChange: 'height',
                            transition: 'height 0.03s linear',
                        }}
                    />
                </div>
            )}
            <div style={{ height: stickyH }} />
        </section>
    )
}

/* ===========================
   StepsStickyReveal
   =========================== */
function StepsStickyReveal({
    trackVH = 240,
    stickyVH = 80,
    thresholds = [0.08, 0.30, 0.55, 0.80],
    fadeWindow = 0.20,
    diagStepPx = 48,
}: {
    trackVH?: number
    stickyVH?: number
    thresholds?: number[]
    fadeWindow?: number
    diagStepPx?: number
}) {
    const vh = useVH()
    const trackH = Math.round((vh * trackVH) / 100)
    const stickyH = Math.round((vh * stickyVH) / 100)

    const trackRef = useRef<HTMLDivElement | null>(null)
    const [p, setP] = useState(0)
    const [phase, setPhase] = useState<'before' | 'pin' | 'after'>('before')

    useEffect(() => {
        let raf = 0
        const onScroll = () => {
            const el = trackRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const total = Math.max(1, rect.height - stickyH)
            const advanced = Math.min(total, Math.max(0, -rect.top))
            setP(advanced / total)

            if (rect.top > 0) setPhase('before')
            else if (rect.bottom >= stickyH) setPhase('pin')
            else setPhase('after')
        }
        const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll) }
        tick()
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick)
        return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick) }
    }, [stickyH])

    const easeOut = (t: number) => t * (2 - t)

    const layerPos: React.CSSProperties =
        phase === 'before'
            ? { position: 'absolute', top: 0, left: 0, right: 0, height: stickyH }
            : phase === 'pin'
                ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: stickyH, zIndex: 5 }
                : { position: 'absolute', left: 0, right: 0, bottom: 0, height: stickyH }

    const renderSteps = () => (
        <div
            style={{
                maxWidth: 1160,
                height: '100%',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingLeft: 24,
                paddingRight: 24,
                background: C.blanc,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: 72,
                    textAlign: 'center',
                    flexWrap: 'nowrap',
                    width: '100%',
                }}
            >
                {[
                    { n: '01', t: 'Écoute', d: 'On clarifie vos envies, votre rythme et vos contraintes.' },
                    { n: '02', t: 'Conception', d: 'Un itinéraire sur-mesure, pensé pour le bon tempo.' },
                    { n: '03', t: 'Organisation', d: 'Transferts, réservations, adresses rares préparées pour vous.' },
                    { n: '04', t: 'Accompagnement', d: 'Avant, pendant, après — vous profitez, on s’occupe du reste.' },
                ].map((step, i) => {
                    const a = Math.max(0, Math.min(1, (p - thresholds[i]) / fadeWindow))
                    const appear = phase === 'after' ? 1 : easeOut(a)
                    const y = i * diagStepPx + (1 - appear) * 16
                    const hidden = appear <= 0.001 && phase !== 'after'
                    return (
                        <div
                            key={step.n}
                            style={{
                                minWidth: 220,
                                transform: `translateY(${y}px)`,
                                opacity: appear,
                                transition: phase === 'after' ? 'none' : 'opacity .28s ease, transform .28s ease',
                                visibility: hidden ? 'hidden' : 'visible',
                            }}
                        >
                            <h3
                                className="m-0"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 600,
                                    letterSpacing: '.08em',
                                    textTransform: 'uppercase',
                                    color: C.taupe, // -> #5a3317
                                    marginBottom: 8,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {step.n}. {step.t}
                            </h3>
                            <p
                                style={{
                                    fontSize: 16,
                                    lineHeight: 1.6,
                                    color: 'rgba(90,51,23,.95)', // ancien rgba(126,114,102,.95) remplacé
                                    margin: 0,
                                    maxWidth: 260,
                                }}
                            >
                                {step.d}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    return (
        <div
            ref={trackRef}
            style={{
                height: trackH,
                position: 'relative',
                overflow: 'visible',
                transform: 'none',
                filter: 'none',
                zIndex: 3,
                background: C.blanc,
            }}
        >
            <div style={{ height: stickyH }} />
            <div style={layerPos}>
                {renderSteps()}
            </div>
            <div style={{ height: 120 }} />
        </div>
    )
}

/* ===========================
   PAGE
   =========================== */
export default function Accueil() {
    const vh = useVH()
    const heroH = Math.round(Math.max(1, vh))
    const cover = useHeroProgress(heroH)
    const y = useScrollY()

    const A = 'Vivez une expérience unique...'
    const B = '...à travers le monde.'

    const REVEAL_SPAN = Math.round(heroH * 1.0)
    const revealP = clamp01(tFrom(y, heroH) / Math.max(1, REVEAL_SPAN))
    const pA = Math.min(revealP / 0.6, 1)
    const pB = revealP <= 0.6 ? 0 : Math.min((revealP - 0.6) / 0.4, 1)
    const countA = revealP > 0 ? Math.max(1, Math.floor(A.length * pA)) : 0
    const countB = pB > 0 ? Math.max(1, Math.floor(B.length * pB)) : 0

    const abRef = useRef<HTMLDivElement | null>(null)
    const [accH, setAccH] = useState(0)
    useLayoutEffect(() => {
        const measure = () => {
            if (!abRef.current) return
            const r = abRef.current.getBoundingClientRect()
            setAccH(Math.ceil(r.height))
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [vh, countA, countB])

    const GAP_VH = 12
    const GAP_PX = (vh * GAP_VH) / 100

    const startY = Math.max(0, (heroH - accH) / 2)
    const targetY = -accH - GAP_PX
    const DIST = Math.max(1, startY - targetY)
    const HANDOFF_SPAN = DIST
    const handoffP = clamp01((tFrom(y, heroH) - REVEAL_SPAN) / HANDOFF_SPAN)
    const currentY = startY + handoffP * (targetY - startY)
    const fadeOutA = 1 - clamp01((handoffP - 0.85) / 0.15)
    const handoffDone = handoffP >= 0.999
    const PAGE_PAD = REVEAL_SPAN + HANDOFF_SPAN

    const EXTRA_GAP_PX = Math.round((vh * 12) / 100)

    return (
        <div
            className="font-[Cormorant_Garamond]"
            style={{ color: C.taupe, background: C.blanc, margin: 0, overflowX: 'hidden' }} // texte par défaut -> #5a3317
        >
            {/* espace réservé au HERO */}
            <div style={{ height: heroH }} />

            {/* HERO fixe */}
            <div
                style={{
                    position: 'fixed', inset: '0 0 auto 0', height: heroH,
                    zIndex: 0, pointerEvents: 'none', overflow: 'hidden'
                }}
                aria-hidden
            >
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${asset('hero.jpg')})`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <h1
                        className="m-0 font-normal tracking-[0.1em]"
                        style={{ color: '#ffffff', textShadow: '0 2px 18px rgba(0,0,0,0.35)', fontSize: '8vw' }}
                    >
                        Âme du Monde
                    </h1>
                </div>
                <div
                    style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0,
                        height: cover * heroH, background: C.blanc
                    }}
                />
            </div>

            {/* accroche A/B */}
            <div
                style={{
                    position: 'fixed', inset: 0,
                    zIndex: 3, pointerEvents: 'none',
                    display: cover >= 0.98 && !handoffDone ? 'block' : 'none',
                }}
                aria-hidden
            >
                <div
                    ref={abRef}
                    style={{
                        position: 'absolute', left: 0, right: 0, top: currentY,
                        opacity: fadeOutA, willChange: 'top, opacity', transform: 'translateZ(0)',
                    }}
                >
                    <div style={{ width: 'min(1160px, 92%)', margin: '0 auto', padding: '0 24px' }}>
                        <h2
                            className="m-0"
                            style={{ color: C.taupe, fontSize: 'clamp(24px,6vw,64px)', lineHeight: 1.08, textAlign: 'left', minHeight: '1.1em' }}
                        >
                            {A.slice(0, countA)}
                        </h2>
                        <h2
                            className="m-0"
                            style={{ color: C.taupe, fontSize: 'clamp(24px,6vw,64px)', lineHeight: 1.08, textAlign: 'right', marginTop: 16, minHeight: '1.1em' }}
                        >
                            {B.slice(0, countB)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* fin accroche */}
            <div style={{ height: PAGE_PAD }} />
            <div style={{ height: EXTRA_GAP_PX }} />

            {/* CONTENU */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {/* ========= Notre agence ========= */}
                <section
                    style={{
                        maxWidth: 1160,
                        margin: '0 auto',
                        paddingTop: 8,
                        paddingBottom: 16,
                        paddingLeft: 24,
                        paddingRight: 24,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(24px,4vw,56px)',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            style={{
                                flex: '1 1 460px',
                                minWidth: 320,
                                minHeight: 520,
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: 0,
                            }}
                        >
                            <div style={{ maxWidth: '56ch' }}>
                                <h2 className="m-0"
                                    style={{ color: C.sable, fontSize: 'clamp(38px,3.6vw,52px)', letterSpacing: '.02em' }}>
                                    Notre agence
                                </h2>
                                <p className="mt-3 font-sans"
                                    style={{ fontSize: 'clamp(20px,1.6vw,22px)', lineHeight: 1.7, color: 'rgba(90,51,23,.95)' }}>
                                    Des voyages sur-mesure, conçus pour une expérience unique, alliant authenticité et équilibre subtil.
                                    Conçus avec soin, nos itinéraires vous laissent la liberté de savourer pleinement chaque moment.
                                </p>
                            </div>
                        </div>

                        {/* >>> Bloc image */}
                        <div style={{ flex: '0 0 auto', marginLeft: 'auto', marginRight: 0 }}>
                            <div
                                aria-hidden
                                role="img"
                                aria-label="Illustration — Notre agence"
                                style={{
                                    width: 'clamp(280px, 32vw, 420px)',
                                    height: 520,
                                    backgroundImage: `url(${asset('1.jpg')})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: 0,
                                }}
                            />
                        </div>
                    </div>

                    <div
                        className="mt-12 md:mt-14"
                        style={{ display: 'flex', gap: 98, alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        {/* >>> Grand visuel */}
                        <div
                            aria-hidden
                            role="img"
                            aria-label="Atmosphère de voyage — Notre agence"
                            style={{
                                flex: '0 0 58%',
                                maxWidth: 680,
                                width: '100%',
                                height: 300,
                                backgroundImage: `url(${asset('2.jpg')})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 0,
                            }}
                        />
                        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', alignItems: 'center' }}>
                            <p className="m-0 font-sans"
                                style={{ fontSize: 'clamp(20px,1.6vw,22px)', lineHeight: 1.75, color: 'rgba(90,51,23,.95)' }}>
                                De l’organisation aux rencontres, chaque détail est façonné pour révéler l’authenticité
                                et créer des souvenirs impérissables.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Espace avant le sticky band */}
                <div style={{ height: Math.round(vh * 0.1) }} />

                {/* ======= BANDEAU INVERSÉ ======= */}
                <StickyBandInverse
                    title="Une approche unique<br/>pour vos voyages"
                    bandColor={C.taupe}   // -> #5a3317
                    textColor={C.blanc}
                    heightVH={100}
                    durationVH={250}
                    hideTitleWhenCovered={true}
                    handoffAdvancePx={0}
                />

                <StepsStickyReveal
                    trackVH={240}
                    stickyVH={80}
                    thresholds={[0.08, 0.30, 0.55, 0.80]}
                    fadeWindow={0.20}
                    diagStepPx={48}
                />

                {/* ======= UNE PROMESSE ======= */}
                <section
                    style={{
                        background: C.blanc,
                        paddingTop: 80,
                        paddingBottom: 80,
                    }}
                >
                    <div
                        style={{
                            maxWidth: 860,
                            margin: '0 auto',
                            display: 'grid',
                            placeItems: 'center',
                            textAlign: 'center',
                            padding: '0 16px',
                        }}
                    >
                        <h2
                            className="mb-6"
                            style={{
                                fontSize: 32,
                                fontWeight: 600,
                                color: C.taupe, // -> #5a3317
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                margin: 0,
                            }}
                        >
                            Une promesse
                        </h2>
                        <p
                            className="font-sans"
                            style={{
                                fontSize: 20,
                                lineHeight: 1.9,
                                color: 'rgba(90,51,23,.95)',
                                maxWidth: 720,
                                margin: '0 auto',
                            }}
                        >
                            Le vrai luxe ne réside pas dans l’accumulation, mais dans la justesse.
                            Nous vous promettons des voyages sobres et raffinés, où chaque détail compte,
                            où chaque moment a sa place. Pas de démesure inutile, seulement la beauté des
                            lieux, la richesse des cultures, et la liberté de n’avoir rien à gérer.
                            <br /><br />
                            <span style={{ color: C.taupe, fontWeight: 600 }}>
                                Notre promesse&nbsp;: vous offrir le privilège de voyager autrement.
                            </span>
                        </p>
                    </div>
                </section>

                {/* ======= BANDEAU FULL-BLEED AVEC IMAGE ======= */}
                <section
                    aria-hidden
                    style={{
                        position: 'relative',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100vw',
                        boxShadow: '0 0 0 1px transparent',
                        backgroundImage: `url(${asset('3.jpg')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: 'min(56vh, 640px)',
                        minHeight: 280,
                        margin: 0,
                        padding: 0,
                        border: 0,
                        borderRadius: 0,
                    }}
                />

                {/* ======= CONTACT ======= */}
                <section
                    style={{
                        background: C.blanc,
                        paddingTop: 72,
                        paddingBottom: 96,
                    }}
                >
                    <div
                        style={{
                            maxWidth: 920,
                            margin: '0 auto',
                            display: 'grid',
                            placeItems: 'center',
                            textAlign: 'center',
                            padding: '0 16px',
                        }}
                    >
                        <h2
                            className="m-0"
                            style={{
                                fontSize: 'clamp(28px,3vw,36px)',
                                color: C.taupe, // -> #5a3317
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                            }}
                        >
                            Votre prochaine évasion commence ici
                        </h2>

                        <p
                            className="mt-4 font-sans"
                            style={{
                                fontSize: 18,
                                lineHeight: 1.8,
                                color: 'rgba(90,51,23,.95)',
                                maxWidth: 680,
                                margin: '12px auto 0',
                            }}
                        >
                            Laissez-nous transformer vos envies en un voyage unique,
                            sculpté selon vos envies.
                        </p>

                        <div style={{ marginTop: 32 }}>
                            <a
                                href="#/contact"
                                className="font-sans text-[15px]"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '14px 28px',
                                    borderRadius: 14,
                                    border: `1px solid ${C.taupe}`,
                                    background: C.taupe,
                                    color: C.blanc,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    transition: 'transform .15s ease, box-shadow .15s ease, opacity .15s ease',
                                }}
                                onMouseDown={e => {
                                    const el = e.currentTarget
                                    el.style.transform = 'translateY(1px)'
                                    el.style.opacity = '0.95'
                                }}
                                onMouseUp={e => {
                                    const el = e.currentTarget
                                    el.style.transform = ''
                                    el.style.opacity = '1'
                                }}
                            >
                                Commencer l’aventure
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* air en bas */}
            <div style={{ height: Math.round(vh * 1.2) }} />
        </div>
    )
}

/** helper */
function tFrom(y: number, heroH: number) {
    const introOrigin = heroH
    return Math.max(0, y - introOrigin)
}
