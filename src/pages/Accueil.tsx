import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

// ⚠️ Dans public/index.html, ajoute bien dans <head> :
// <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

// utilitaire assets (GH Pages friendly)
const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, '')}`;

/** Palette */
const C = {
    sable: '#1b120b',
    taupe: '#5a3317',
    ocre: '#5a3317',
    blanc: '#F9F8F6',
    bleu: '#7c9fb9',
    noir: '#121212',
    cuivre: '#9c541e',
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }

/* ──────────────────────────────────────────────────────────────
   Breakpoints & global helpers
   ────────────────────────────────────────────────────────────── */
function useBreakpoint() {
    const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
    useEffect(() => {
        const on = () => setW(window.innerWidth)
        on()
        window.addEventListener('resize', on, { passive: true })
        return () => window.removeEventListener('resize', on)
    }, [])
    return {
        w,
        isPhone: w <= 480,
        isTablet: w > 480 && w <= 960,
        isDesktop: w > 960,
    }
}

function SafeAreaPad({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
        }}>
            {children}
        </div>
    )
}

function MobileGlobalCSS() {
    return (
        <style>{`
      /* typographie & layout responsive */
      @media (max-width: 480px) { html { font-size: 17px; } }
      .bg-cover-center { background-size: cover; background-position: center; image-rendering: auto; }
      .container { width: min(1160px, 92%); margin: 0 auto; padding-left: 16px; padding-right: 16px; }

      /* steps layout hints (desktop/tablet) */
      @media (max-width: 960px) { .steps-row { gap: 40px; } }
      @media (max-width: 640px) {
        .steps-row { flex-wrap: wrap; gap: 28px; justify-content: center; }
        .step-card { min-width: 45%; }
      }
      @media (max-width: 480px) { .step-card { min-width: 100%; } }

      /* mobile/touch smoothness */
      html, body { scroll-behavior: auto; overscroll-behavior-y: contain; }
      body { -webkit-overflow-scrolling: touch; }
      * { -webkit-tap-highlight-color: transparent; }

      /* boutons sur mobile */
      @media (hover: none) {
        .btn-tap { transition: opacity .15s ease; }
        .btn-tap:active { opacity: .85; transform: none !important; }
      }
    `}</style>
    )
}

/* ──────────────────────────────────────────────────────────────
   Mesures viewport & scroll
   ────────────────────────────────────────────────────────────── */
function useVH() {
    const [vh, setVh] = useState(0)
    useEffect(() => {
        const u = () => setVh(window.innerHeight)
        u()
        window.addEventListener('resize', u)
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', u)
        return () => {
            window.removeEventListener('resize', u)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', u)
        }
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

function useScrollY(): number {
    const [y, setY] = React.useState(0);
    React.useEffect(() => {
        let raf = 0;
        const read = () => (window.scrollY ?? window.pageYOffset ?? 0);
        const tick = () => { raf = 0; setY(read()); };
        const onScroll = () => { if (raf) return; raf = requestAnimationFrame(tick); };
        setY(read());
        window.addEventListener('scroll', onScroll, { passive: true });
        const onVis = () => { if (document.visibilityState === 'hidden' && raf) { cancelAnimationFrame(raf); raf = 0; } };
        document.addEventListener('visibilitychange', onVis);
        return () => {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('visibilitychange', onVis);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);
    return y;
}

/* ──────────────────────────────────────────────────────────────
   GlobalStyles (accroche animée)
   ────────────────────────────────────────────────────────────── */
function GlobalStyles() {
    return (
        <style>{`
@keyframes accroche-reveal { to { opacity: 1; transform: translateY(0); } }
.accroche-char { display: inline-block; opacity: 0; transform: translateY(12px); animation: accroche-reveal 700ms cubic-bezier(.2,.65,.35,1) forwards; will-change: transform, opacity; }
@media (prefers-reduced-motion: reduce) {
  .accroche-char { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`}</style>
    )
}

/* ──────────────────────────────────────────────────────────────
   Accroche ligne (lettres)
   ────────────────────────────────────────────────────────────── */
function AccrocheLine({
    text,
    align = 'left',
    fontSize = 'clamp(24px,6vw,64px)',
    letterSpacing = '0.015em',
    delayStartMs = 0,
    stepDelayMs = 22,
}: {
    text: string
    align?: 'left' | 'right' | 'center'
    fontSize?: string
    letterSpacing?: string
    delayStartMs?: number
    stepDelayMs?: number
}) {
    const chars = Array.from(text)
    return (
        <h2
            className="m-0"
            style={{
                color: C.taupe,
                fontSize,
                letterSpacing,
                lineHeight: 1.08,
                textAlign: align,
                minHeight: '1.1em',
                ['--accroche-size' as any]: fontSize,
            }}
            aria-label={text}
        >
            {chars.map((ch, i) => (
                <span
                    key={i}
                    className="accroche-char"
                    style={{
                        ['--i' as any]: i,
                        animationDelay: `calc(${delayStartMs}ms + var(--i) * ${stepDelayMs}ms)`,
                    } as React.CSSProperties}
                >
                    {ch === ' ' ? '\u00A0' : ch}
                </span>
            ))}
        </h2>
    )
}

/* ──────────────────────────────────────────────────────────────
   Accroche scroll-réactive
   ────────────────────────────────────────────────────────────── */
const AccrocheLineScroll = React.memo(function AccrocheLineScroll({
    text,
    progress,
    align = 'left',
    fontSize = 'clamp(24px,6vw,64px)',
    letterSpacing = '0.015em',
    hardness = 1.0,
    yOffset = 12,
}: {
    text: string
    progress: number
    align?: 'left' | 'right' | 'center'
    fontSize?: string
    letterSpacing?: string
    hardness?: number
    yOffset?: number
}) {
    const chars = React.useMemo(() => Array.from(text), [text])
    const n = chars.length
    const rList = React.useMemo(() => {
        if (n <= 1) return [1]
        const LAST_EPS = 0.015
        return Array.from({ length: n }, (_, i) =>
            i === n - 1 ? Math.max(0, 1 - LAST_EPS) : i / (n - 1)
        )
    }, [n])
    const smooth = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }
    const P0 = 0.004, P1 = 0.992
    const p = progress <= P0 ? 0 : progress >= P1 ? 1 : (progress - P0) / (P1 - P0)

    return (
        <h2
            className="m-0"
            style={{
                color: C.taupe,
                fontSize,
                letterSpacing,
                lineHeight: 1.08,
                textAlign: align,
                minHeight: '1.1em',
                ['--accroche-size' as any]: fontSize,
            }}
            aria-label={text}
        >
            {chars.map((ch, i) => {
                const r = rList[i]
                const denom = Math.max(1e-6, 1 - r)
                let a = (p - r) / denom
                a = smooth(Math.pow(Math.min(1, Math.max(0, a)), hardness))
                const ty = (1 - a) * yOffset
                const op = a
                return (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            transform: `translate3d(0, ${ty}px, 0)`,
                            opacity: op,
                            willChange: op === 0 || op === 1 ? 'auto' : 'transform, opacity',
                        }}
                    >
                        {ch === ' ' ? '\u00A0' : ch}
                    </span>
                )
            })}
        </h2>
    )
})

/* ──────────────────────────────────────────────────────────────
   Sticky utilities
   ────────────────────────────────────────────────────────────── */
function getTopOffset(extra = 0): number {
    // @ts-ignore
    const vvTop = window.visualViewport?.offsetTop ?? 0
    const nav = document.getElementById('site-nav') as HTMLElement | null
    const navH = nav ? (nav.offsetHeight || nav.getBoundingClientRect().height || 0) : 0
    const cs = nav ? getComputedStyle(nav) : null
    const mt = cs ? parseFloat(cs.marginTop || '0') || 0 : 0
    const mb = cs ? parseFloat(cs.marginBottom || '0') || 0 : 0
    return Math.round(vvTop + navH + mt + mb + extra)
}

function StickyBandSequence({
    title = 'Une approche unique pour vos voyages',
    bandColor = C.taupe,
    textColor = C.blanc,
    stickyVH = 100,
    durationVH = 140,
    triggerAdvanceVH = 20,
}: {
    title?: string
    bandColor?: string
    textColor?: string
    stickyVH?: number
    durationVH?: number
    triggerAdvanceVH?: number
}) {
    const vh = useVH()
    const stickyH = Math.max(1, Math.round((vh * stickyVH) / 100))
    const phaseH = Math.max(1, Math.round((vh * durationVH) / 100))
    const trackH = phaseH * 2

    const sectionRef = useRef<HTMLElement | null>(null)
    const [p, setP] = useState(0)
    const [phase, setPhase] = useState<'before' | 'pin' | 'after'>('before')
    const [topOffsetReal, setTopOffsetReal] = useState(getTopOffset())
    const advancePx = Math.round((vh * triggerAdvanceVH) / 100)
    const sentDone = useRef(false)

    // ⚠️ EPS plus large sur phone (moins de setState)
    const isPhone = useBreakpoint().isPhone
    const EPS = isPhone ? 0.0018 : 0.0008

    // Utilise offsetTop/offsetHeight (évite getBoundingClientRect à chaque frame)
    useEffect(() => {
        let raf = 0

        const onScrollCompute = () => {
            const el = sectionRef.current; if (!el) return

            const toReal = getTopOffset()
            if (toReal !== topOffsetReal) setTopOffsetReal(toReal)

            // lectures layout (regroupées et uniques par tick)
            const elTop = el.offsetTop
            const elH = el.offsetHeight
            const total = Math.max(1, elH - stickyH)

            // position du haut de la fenêtre + déclenchement avancé
            const scrollTop = (window.scrollY || 0)
            const toTrig = toReal - advancePx
            const advanced = Math.min(total, Math.max(0, (scrollTop + toTrig) - elTop))
            const np = advanced / total

            setP(prev => (Math.abs(prev - np) > EPS ? np : prev))

            // phase
            if ((scrollTop + toTrig) < elTop) {
                setPhase(prev => (prev !== 'before' ? 'before' : prev))
            } else if ((scrollTop + toTrig) <= elTop + total) {
                setPhase(prev => (prev !== 'pin' ? 'pin' : prev))
            } else {
                setPhase(prev => (prev !== 'after' ? 'after' : prev))
            }

            if (np >= 0.999 && !sentDone.current) {
                sentDone.current = true
                window.dispatchEvent(new CustomEvent('amd_band_done', { detail: { stickyH, topOffset: toReal } }))
            }
            if (np < 0.5 && sentDone.current) sentDone.current = false
        }

        const tick = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(onScrollCompute) }

        // 1ère mesure
        tick()
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick)
        // garder visualViewport *resize* (barres iOS), pas de *scroll*
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', tick)

        return () => {
            if (raf) cancelAnimationFrame(raf)
            window.removeEventListener('scroll', tick)
            window.removeEventListener('resize', tick)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', tick)
        }
    }, [stickyH, advancePx, topOffsetReal, EPS])

    // Éasing + split
    const ease = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }
    const split = 0.5
    const inReveal = p < split
    const revealP = inReveal ? ease(p / split) : 1
    const coverP = inReveal ? 0 : ease((p - split) / (1 - split))

    // Styles fixes
    const fixedLayer: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, height: stickyH,
        transform: `translate3d(0, ${topOffsetReal}px, 0)`,
        zIndex: 6, overflow: 'hidden', background: 'transparent',
        willChange: 'transform',
        paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)',
    }

    // 🎭 Rideau haut (pour la phase "révélation") — on le pousse vers le haut
    const curtainTopStyle: React.CSSProperties = {
        position: 'absolute', inset: 0,
        background: bandColor,
        transform: `translate3d(0, ${(-1 + revealP) * 100}%, 0)`, // de 0% à -100%
        willChange: 'transform',
    }

    // 🧾 Couche texte (toujours visible sous le rideau)
    const textLayerStyle: React.CSSProperties = {
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none',
    }

    // 🧻 Rideau blanc (recouvrement) — scaleY du bas vers le haut
    const coverOverlayStyle: React.CSSProperties = {
        position: 'absolute', inset: 0, background: C.blanc,
        transform: `scaleY(${coverP})`,
        transformOrigin: 'bottom',
        willChange: 'transform',
        pointerEvents: 'none',
    }

    return (
        <section ref={sectionRef as any} style={{ height: trackH, position: 'relative' }}>
            {phase === 'pin' && (
                <div style={fixedLayer} className="fixed-smooth" aria-hidden>
                    {/* rideau haut qui se lève (GPU transform) */}
                    <div style={curtainTopStyle} />

                    {/* contenu du bandeau */}
                    <div style={textLayerStyle}>
                        <h2
                            className="m-0 no-shadow-during-pin"
                            style={{
                                color: textColor,
                                fontSize: 'var(--accroche-size, clamp(24px,6vw,64px))',
                                lineHeight: 1.2,
                                letterSpacing: '0.015em',
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                                padding: '0 24px',
                                opacity: 1,
                            }}
                        >
                            {title}
                        </h2>
                    </div>

                    {/* recouvrement blanc (phase 2) */}
                    {!inReveal && <div style={coverOverlayStyle} />}
                </div>
            )}
        </section>
    )
}

/* ──────────────────────────────────────────────────────────────
   StepsStickyReveal — version optimisée mobile
   ────────────────────────────────────────────────────────────── */
function StepsStickyReveal({
    trackVH = 160,
    stickyVH = 80,
    thresholds = [0.00, 0.22, 0.48, 0.74],
    fadeWindow = 0.18,
}: {
    trackVH?: number
    stickyVH?: number
    thresholds?: number[]
    fadeWindow?: number
}) {
    const vh = useVH()
    const trackH = Math.round((vh * trackVH) / 100)
    const stickyH = Math.round((vh * stickyVH) / 100)

    const [topOffset, setTopOffset] = useState(getTopOffset())
    const [armed, setArmed] = useState(false)

    // handoff quand le bandeau est terminé
    useEffect(() => {
        const onDone = (e: any) => {
            setArmed(true)
            if (e?.detail?.topOffset != null) setTopOffset(e.detail.topOffset)
        }
        const onVV = () => setTopOffset(getTopOffset())
        window.addEventListener('amd_band_done', onDone as any)
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', onVV)
        // (pas de visualViewport.scroll, trop bruyant)
        return () => {
            window.removeEventListener('amd_band_done', onDone as any)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', onVV)
        }
    }, [])

    const trackRef = useRef<HTMLDivElement | null>(null)
    const [p, setP] = useState(0)
    const [phase, setPhase] = useState<'before' | 'pin' | 'after'>('before')

    // Écouteurs stables (pas de dépendance sur p/phase)
    useEffect(() => {
        let raf = 0
        const EPS = 0.0008

        const onScrollCompute = () => {
            const el = trackRef.current; if (!el) return
            const rect = el.getBoundingClientRect()
            const to = topOffset
            const total = Math.max(1, rect.height - stickyH)
            const advanced = Math.min(total, Math.max(0, to - rect.top))
            const np = advanced / total

            setP(prev => (Math.abs(prev - np) > EPS ? np : prev))

            const nextPhase =
                (rect.top - to > 0) ? 'before' :
                    (rect.bottom >= stickyH + to) ? 'pin' : 'after'

            setPhase(prev => (prev === nextPhase ? prev : nextPhase))
        }

        const tick = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(onScrollCompute) }

        tick()
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick)
        // garder VV *resize*, supprimer VV *scroll*
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', tick)

        return () => {
            if (raf) cancelAnimationFrame(raf)
            window.removeEventListener('scroll', tick)
            window.removeEventListener('resize', tick)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', tick)
        }
    }, [stickyH, topOffset, trackH])

    const effectiveP = armed ? p : 0

    const layerPos: React.CSSProperties =
        phase === 'before'
            ? { position: 'absolute', top: 0, left: 0, right: 0, height: stickyH }
            : phase === 'pin'
                ? {
                    position: 'fixed', top: 0, left: 0, right: 0, height: stickyH,
                    zIndex: 10, transform: `translate3d(0, ${topOffset}px, 0)`,
                    willChange: 'transform', pointerEvents: 'none', background: 'transparent',
                }
                : { position: 'absolute', left: 0, right: 0, bottom: 0, height: stickyH }

    const steps = [
        { n: '01', t: 'Écoute', d: 'On clarifie vos envies, votre rythme et vos contraintes.' },
        { n: '02', t: 'Conception', d: 'Un itinéraire sur-mesure, pensé pour le bon tempo.' },
        { n: '03', t: 'Organisation', d: 'Transferts, réservations, adresses rares préparées pour vous.' },
        { n: '04', t: 'Accompagnement', d: 'Avant, pendant, après — vous profitez, on s’occupe du reste.' },
    ]

    return (
        <div
            ref={trackRef}
            style={{ height: trackH, position: 'relative', overflow: 'visible', zIndex: 8, background: 'transparent' }}
        >
            <div style={layerPos} className={phase === 'pin' ? 'fixed-smooth' : undefined}>
                <div style={{
                    maxWidth: 1160, height: '100%', margin: '0 auto',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    paddingLeft: 24, paddingRight: 24, background: 'transparent',
                }}>
                    <div className="steps-row" style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                        gap: 72, textAlign: 'center', flexWrap: 'nowrap', width: '100%',
                    }}>
                        {steps.map((step, i) => {
                            const a = Math.max(0, Math.min(1, (effectiveP - thresholds[i]) / fadeWindow))
                            const appear = phase === 'after' ? 1 : a
                            const y = i * 48 + (1 - appear) * 16
                            const hidden = appear <= 0.001 && phase !== 'after'
                            return (
                                <div
                                    key={step.n}
                                    className="step-card"
                                    style={{
                                        minWidth: 220,
                                        transform: `translateY(${y}px) translateZ(0)`,
                                        opacity: appear,
                                        willChange: 'transform, opacity',
                                        visibility: hidden ? 'hidden' : 'visible',
                                    }}
                                >
                                    <h3 className="m-0" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.cuivre, marginBottom: 8, whiteSpace: 'nowrap' }}>
                                        {step.n}. {step.t}
                                    </h3>
                                    <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(90,51,23,.95)', margin: 0, maxWidth: 260 }}>
                                        {step.d}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────
   StepsVertical — version optimisée mobile (zéro setState)
   ────────────────────────────────────────────────────────────── */
function StepsVertical() {
    const ref = React.useRef<HTMLDivElement | null>(null)

    // CSS local au composant (léger + GPU-friendly)
    const Styles = (
        <style>{`
      .sv-wrap { padding: 36px 16px 12px; background: transparent; }
      .sv-container { max-width: 720px; margin: 0 auto; }
      .sv-item {
        opacity: 0;
        transform: translate3d(0, 12px, 0);
        transition: opacity .28s ease, transform .28s ease;
        will-change: transform, opacity;
        background: transparent;
        padding: 14px 4px;
      }
      .sv-item.on {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
      .sv-sep { height: 1px; background: rgba(90,51,23,.12); }
      @media (prefers-reduced-motion: reduce) {
        .sv-item, .sv-item.on { transition: none !important; transform: none !important; opacity: 1 !important; }
      }
    `}</style>
    )

    React.useEffect(() => {
        const root = ref.current
        if (!root) return
        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'))

        // IO ultra simple : on ajoute .on une fois, puis on unobserve
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (!e.isIntersecting) continue
                    const el = e.target as HTMLElement
                    el.classList.add('on')
                    io.unobserve(el)         // évite tout travail supplémentaire
                }
            },
            {
                // Révèle quand ~20% visible, déclenche un peu avant (rootMargin bas)
                threshold: 0.2,
                rootMargin: '0px 0px -15% 0px',
            }
        )

        items.forEach((it) => io.observe(it))
        return () => io.disconnect()
    }, [])

    const steps = [
        { n: '01', t: 'Écoute', d: 'On clarifie vos envies, votre rythme et vos contraintes.' },
        { n: '02', t: 'Conception', d: 'Un itinéraire sur-mesure, pensé pour le bon tempo.' },
        { n: '03', t: 'Organisation', d: 'Transferts, réservations, adresses rares préparées pour vous.' },
        { n: '04', t: 'Accompagnement', d: 'Avant, pendant, après — vous profitez, on s’occupe du reste.' },
    ]

    return (
        <section ref={ref} className="sv-wrap">
            {Styles}
            <div className="sv-container">
                {steps.map((s) => (
                    <div key={s.n} data-step className="sv-item">
                        <h3
                            className="m-0"
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                                color: C.cuivre,
                                marginBottom: 6,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {s.n}. {s.t}
                        </h3>
                        <p className="m-0 font-sans" style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(90,51,23,.95)' }}>
                            {s.d}
                        </p>
                        <div style={{ height: 10 }} />
                        <div className="sv-sep" />
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────── */
export default function Accueil() {
    const vh = useVH()
    const heroH = Math.round(Math.max(1, vh))
    const cover = useHeroProgress(heroH)
    const y = useScrollY()

    const A = 'Vivez une expérience unique'
    const B = 'à travers le monde.'

    const REVEAL_SPAN = Math.round(heroH * 1.0)
    const revealP = clamp01(tFrom(y, heroH) / Math.max(1, REVEAL_SPAN))

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
    }, [vh])

    const GAP_VH = 25
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
    const [hideHeroCover, setHideHeroCover] = useState(false)
    useEffect(() => {
        const onPin = () => setHideHeroCover(true)
        window.addEventListener('amd_band_done', onPin as any)
        return () => window.removeEventListener('amd_band_done', onPin as any)
    }, [])
    const EXTRA_GAP_PX = Math.round((vh * 12) / 100)
    const bp = useBreakpoint()
    return (
        <div className="font-[Cormorant_Garamond]" style={{ color: C.taupe, background: C.blanc, margin: 0, overflowX: 'hidden' }}>
            <GlobalStyles />
            <MobileGlobalCSS />

            {/* espace réservé au HERO */}
            <div style={{ height: heroH }} />

            {/* HERO fixe */}
            {!handoffDone && (
                <div
                    style={{ position: 'fixed', inset: '0 0 auto 0', height: heroH, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
                    aria-hidden
                >
                    <div
                        className="bg-cover-center"
                        style={{ position: 'absolute', inset: 0, backgroundImage: `url(${asset('hero.jpg')})` }}
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                        <h1 className="m-0 font-normal tracking-[0.1em]" style={{ color: C.blanc, textShadow: '0 2px 18px rgba(0,0,0,0.35)', fontSize: '8vw' }}>
                            Âme du Monde
                        </h1>
                    </div>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: cover * heroH, background: C.blanc }} />
                </div>
            )}

            {/* accroche A/B */}
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none', display: revealP >= 0.0 && !handoffDone ? 'block' : 'none' }}
                aria-hidden
            >
                <div
                    ref={abRef}
                    style={{ position: 'absolute', left: 0, right: 0, top: currentY, opacity: fadeOutA, willChange: 'top, opacity', transform: 'translateZ(0)' }}
                >
                    <div className="container">
                        <AccrocheLineScroll
                            text={A}
                            progress={Math.min(1, revealP / 0.6)}
                            align="left"
                            fontSize="clamp(24px,6vw,64px)"
                            letterSpacing="0.015em"
                            hardness={1.0}
                            yOffset={12}
                        />
                        <div style={{ height: 16 }} />
                        <AccrocheLineScroll
                            text={B}
                            progress={revealP <= 0.6 ? 0 : Math.min(1, (revealP - 0.6) / 0.4)}
                            align="right"
                            fontSize="clamp(24px,6vw,64px)"
                            letterSpacing="0.015em"
                            hardness={1.0}
                            yOffset={12}
                        />
                    </div>
                </div>
            </div>

            {/* fin accroche */}
            <div style={{ height: PAGE_PAD }} />
            <div style={{ height: EXTRA_GAP_PX }} />

            {/* CONTENU */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {/* ========= Notre agence ========= */}
                <section style={{ maxWidth: 1160, margin: '0 auto', paddingTop: 8, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px,4vw,56px)', rowGap: 'clamp(28px,5vw,72px)', flexWrap: 'wrap', marginBottom: 'clamp(28px,6vw,72px)'}}>
                        <div style={{ flex: '1 1 460px', minWidth: 320, minHeight: 520, display: 'flex', alignItems: 'center', paddingLeft: 0 }}>
                            <div style={{ maxWidth: '56ch' }}>
                                <h2 className="m-0" style={{ color: C.cuivre, fontSize: 'clamp(38px,3.6vw,52px)', letterSpacing: '.02em' }}>
                                    Notre agence
                                </h2>
                                <p className="mt-3 font-sans" style={{ fontSize: 'clamp(20px,1.6vw,22px)', lineHeight: 1.7, color: 'rgba(90,51,23,.95)' }}>
                                    Des voyages sur-mesure, conçus pour une expérience unique, alliant authenticité et équilibre subtil.
                                    Conçus avec soin, nos itinéraires vous laissent la liberté de savourer pleinement chaque moment.
                                </p>
                            </div>
                        </div>

                        {/* Image droite (portrait) */}
                        <div style={{ flex: '0 0 auto', marginLeft: 'auto', marginRight: 0 }}>
                            <div
                                aria-hidden
                                role="img"
                                aria-label="Illustration — Notre agence"
                                className="bg-cover-center"
                                style={{
                                    width: 'min(420px, 80vw)',
                                    aspectRatio: '3 / 4',
                                    borderRadius: 0,
                                    backgroundImage: `url(${asset('1.jpg')})`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-12 md:mt-14 container" style={{ display: 'flex', gap: 'clamp(24px,5vw,72px)', rowGap: 'clamp(24px,5vw,64px)', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Grand visuel (paysage) */}
                        <div
                            aria-hidden
                            role="img"
                            aria-label="Atmosphère de voyage — Notre agence"
                            className="bg-cover-center"
                            style={{
                                flex: '1 1 58%',
                                maxWidth: 680,
                                width: '100%',
                                aspectRatio: '16 / 9',
                                borderRadius: 0,
                                backgroundImage: `url(${asset('2.jpg')})`,
                            }}
                        />
                        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', alignItems: 'center' }}>
                            <p className="m-0 font-sans" style={{ fontSize: 'clamp(20px,1.6vw,22px)', lineHeight: 1.75, color: 'rgba(90,51,23,.95)' }}>
                                De l’organisation aux rencontres, chaque détail est façonné pour révéler l’authenticité
                                et créer des souvenirs impérissables.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Espace avant le sticky band */}
                <div style={{ height: Math.round(vh * 0.0) }} />

                <StickyBandSequence
                    stickyVH={bp.isPhone ? 90 : bp.isTablet ? 95 : 100}
                    durationVH={bp.isPhone ? 115 : bp.isTablet ? 125 : 140}
                    triggerAdvanceVH={bp.isPhone ? 20 : 22}   // 20–22 : safe
                />

                {bp.isPhone ? (
                    <StepsVertical />
                ) : (
                    <StepsStickyReveal
                        trackVH={bp.isTablet ? 170 : 160}
                        stickyVH={bp.isTablet ? 75 : 80}
                        thresholds={[0.00, 0.22, 0.48, 0.74]}
                        fadeWindow={0.20}
                    />
                )}

                {/* ======= UNE PROMESSE ======= */}
                <section style={{ background: C.blanc, paddingTop: 180, paddingBottom: 120 }}>
                    <SafeAreaPad>
                        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '0 16px' }}>
                            <h2 className="mb-6" style={{ fontSize: 32, fontWeight: 600, color: C.cuivre, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Une promesse
                            </h2>
                            <p className="font-sans" style={{ fontSize: 20, lineHeight: 1.9, color: 'rgba(90,51,23,.95)', maxWidth: 720, margin: '0 auto' }}>
                                Le vrai luxe ne réside pas dans l’accumulation, mais dans la justesse.
                                Nous vous promettons des voyages sobres et raffinés, où chaque détail compte,
                                où chaque moment a sa place. Pas de démesure inutile, seulement la beauté des
                                lieux, la richesse des cultures, et la liberté de n’avoir rien à gérer.
                                <br /><br />
                                <span style={{ color: C.cuivre, fontWeight: 600 }}>
                                    Notre promesse&nbsp;: vous offrir le privilège de voyager autrement.
                                </span>
                            </p>
                        </div>
                    </SafeAreaPad>
                </section>

                {/* ======= BANDEAU FULL-BLEED AVEC IMAGE ======= */}
                <section
                    aria-hidden
                    className="bg-cover-center"
                    style={{
                        position: 'relative',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100vw',
                        height: 'min(50vh, 560px)',
                        minHeight: '36vh',
                        backgroundImage: `url(${asset('3.jpg')})`,
                        boxShadow: '0 0 0 1px transparent',
                    }}
                />

                {/* ======= CONTACT ======= */}
                <section style={{ background: C.blanc, paddingTop: 272, paddingBottom: 126 }}>
                    <SafeAreaPad>
                        <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '0 16px' }}>
                            <h2 className="m-0" style={{ fontSize: 'clamp(28px,3vw,36px)', color: C.cuivre, fontWeight: 600, letterSpacing: '0.02em' }}>
                                Votre prochaine évasion commence ici
                            </h2>

                            <p className="mt-4 font-sans" style={{ fontSize: 18, lineHeight: 1.8, color: 'rgba(90,51,23,.95)', maxWidth: 680, margin: '12px auto 0' }}>
                                Laissez-nous transformer vos envies en un voyage unique,
                                sculpté selon vos envies.
                            </p>

                            <div style={{ marginTop: 32 }}>
                                <a
                                    href="#/contact"
                                    className="font-sans text-[15px] btn-tap"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '16px 22px', minHeight: 44, borderRadius: 14,
                                        border: `1px solid ${C.taupe}`, background: C.cuivre, color: C.blanc,
                                        textDecoration: 'none', fontWeight: 500,
                                        transition: 'transform .15s ease, box-shadow .15s ease, opacity .15s ease',
                                    }}
                                    onMouseDown={e => {
                                        if (window.matchMedia('(hover: hover)').matches) {
                                            const el = e.currentTarget
                                            el.style.transform = 'translateY(1px)'
                                            el.style.opacity = '0.95'
                                        }
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
                    </SafeAreaPad>
                </section>
            </div>

            {/* air en bas */}
            <div style={{ height: Math.round(vh * 0.1) }} />
        </div>
    )
}

/** helper */
function tFrom(y: number, heroH: number) {
    const introOrigin = heroH
    return Math.max(0, y - introOrigin)
}
