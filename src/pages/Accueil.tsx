import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

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
   Helpers responsive
   ────────────────────────────────────────────────────────────── */
function useBreakpoint() {
    const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
    useEffect(() => {
        const on = () => setW(window.innerWidth)
        on()
        window.addEventListener('resize', on, { passive: true })
        return () => window.removeEventListener('resize', on)
    }, [])
    return { w, isPhone: w <= 480, isTablet: w > 480 && w <= 960, isDesktop: w > 960 }
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

  @media (max-width: 960px) { .steps-row { gap: 40px; } }
  @media (max-width: 640px) {
    .steps-row { flex-wrap: wrap; gap: 28px; justify-content: center; }
    .step-card { min-width: 45%; }
  }
  @media (max-width: 480px) { .step-card { min-width: 100%; } }

  /* mobile/touch smoothness */
  html, body {
    scroll-behavior: auto;
    overscroll-behavior-y: contain;    /* évite le “ping” d’overscroll */
    touch-action: pan-y;               /* dit au moteur: geste vertical natif */
    -webkit-text-size-adjust: 100%;
  }
  body {
    -webkit-overflow-scrolling: touch; /* inertie iOS native */
  }
  * { -webkit-tap-highlight-color: transparent; }

  /* isolation de paint pour les grands calques */
  .isolate { contain: paint; backface-visibility: hidden; transform: translateZ(0); }

  /* lazy paint pour sections lourdes */
  .cv-auto { content-visibility: auto; contain-intrinsic-size: 800px 600px; }

  /* évite les transitions fantômes lors de l’inversion du scroll */
  .fixed-smooth { will-change: transform; backface-visibility: hidden; transform: translateZ(0); }
`}</style>
    )
}

/* ──────────────────────────────────────────────────────────────
   Mesures viewport & scroll (optimisées)
   ────────────────────────────────────────────────────────────── */
function useVH() {
    const [vh, setVh] = useState(0)
    useEffect(() => {
        const u = () => setVh(window.innerHeight)
        u()
        window.addEventListener('resize', u, { passive: true })
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

/** Un SEUL listener scroll → rAF → y */
function useRafScroll() {
    const [y, setY] = useState(0)
    const rafRef = useRef(0)
    const yRef = useRef(0)

    useEffect(() => {
        const read = () => (window.scrollY ?? window.pageYOffset ?? 0)
        const tick = () => { rafRef.current = 0; const next = read(); if (next !== yRef.current) { yRef.current = next; setY(next) } }
        const onScroll = () => { if (rafRef.current) return; rafRef.current = requestAnimationFrame(tick) }

        // init
        yRef.current = read(); setY(yRef.current)
        window.addEventListener('scroll', onScroll, { passive: true })
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }
        }, { passive: true })

        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])
    return y
}

/** mesure absolue d’un élément (offsetTop) + hauteur, recalculée au resize */
function useAbsMetrics<T extends HTMLElement>(ref: React.RefObject<T>) {
    const [m, setM] = useState({ top: 0, height: 0 })
    const measure = useMemo(() => () => {
        const el = ref.current; if (!el) return
        let top = 0; let node: HTMLElement | null = el
        while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null }
        const height = el.offsetHeight
        setM({ top, height })
    }, [ref])

    useLayoutEffect(() => { measure() }, [measure])
    useEffect(() => {
        const ro = new ResizeObserver(() => measure())
        if (ref.current) ro.observe(ref.current)
        const on = () => measure()
        window.addEventListener('resize', on, { passive: true })
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', on)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', on)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', on)
        }
    }, [measure, ref])
    return m
}

/* ──────────────────────────────────────────────────────────────
   Accroche animée (identique visuellement)
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
                color: C.taupe, fontSize, letterSpacing, lineHeight: 1.08,
                textAlign: align, minHeight: '1.1em', ['--accroche-size' as any]: fontSize,
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

function useStableTopOffset(extra = 0, debounceMs = 120, pixelHysteresis = 4) {
    const [topOffset, setTopOffset] = useState(getTopOffset(extra))
    const last = useRef(topOffset)
    useEffect(() => {
        let to: number | null = null
        const apply = () => {
            to = null
            const next = getTopOffset(extra)
            if (Math.abs(next - last.current) >= pixelHysteresis) {
                last.current = next
                setTopOffset(next)
            }
        }
        const schedule = () => { if (to != null) window.clearTimeout(to); to = window.setTimeout(apply, debounceMs) }
        const on = schedule

        window.addEventListener('resize', on, { passive: true })
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', on)

        return () => {
            window.removeEventListener('resize', on)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', on)
            if (to != null) window.clearTimeout(to)
        }
    }, [extra, debounceMs, pixelHysteresis])
    return topOffset
}

/* ──────────────────────────────────────────────────────────────
   StickyBandSequence — même rendu, calculs sans reflow en scroll
   ────────────────────────────────────────────────────────────── */
function StickyBandSequence({
    title = 'Une approche unique pour vos voyages',
    bandColor = C.taupe,
    textColor = C.blanc,
    stickyVH = 100,
    durationVH = 140,
    triggerAdvanceVH = 20,
    handoffGuardPx = 8, // marge anti-chevauchement (coupe un peu avant le haut)
}: {
    title?: string
    bandColor?: string
    textColor?: string
    stickyVH?: number
    durationVH?: number
    triggerAdvanceVH?: number
    handoffGuardPx?: number
}) {
    const vh = useVH()
    const stickyH = Math.max(1, Math.round((vh * stickyVH) / 100))
    const phaseH = Math.max(1, Math.round((vh * durationVH) / 100))
    const trackH = phaseH * 2

    const sectionRef = React.useRef<HTMLElement | null>(null)
    const { top: absTop, height: absHeight } = useAbsMetrics(sectionRef)
    const y = useRafScroll()

    // offset sous la barre de nav (mesuré uniquement au resize)
    const [topOffset, setTopOffset] = React.useState(getTopOffset())
    React.useEffect(() => {
        const upd = () => setTopOffset(getTopOffset())
        window.addEventListener('resize', upd, { passive: true })
        // @ts-ignore
        window.visualViewport?.addEventListener?.('resize', upd)
        return () => {
            window.removeEventListener('resize', upd)
            // @ts-ignore
            window.visualViewport?.removeEventListener?.('resize', upd)
        }
    }, [])

    // Géométrie (sans reflow pendant le scroll)
    const rectTop = absTop - y
    const rectBottom = rectTop + absHeight
    const triggerTop = topOffset - Math.round((vh * triggerAdvanceVH) / 100)

    const total = Math.max(1, absHeight - stickyH)
    const advanced = Math.min(total, Math.max(0, triggerTop - rectTop))
    const p = advanced / total

    // Phases (le calque reste FIXE, aucune translation)
    const phase: 'before' | 'pin' | 'after' =
        (rectTop - triggerTop > 0) ? 'before'
            : (rectBottom >= stickyH + triggerTop + handoffGuardPx) ? 'pin' : 'after'

    // Révélation / recouvrement (clip + overlay)
    const ease = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }
    const split = 0.5
    const inReveal = p < split
    const revealP = inReveal ? ease(p / split) : 1
    const coverP = inReveal ? 0 : ease((p - split) / (1 - split))
    const clipTopPercent = (1 - revealP) * 100

    // Handoff unique une fois la garde franchie
    const sentDone = React.useRef(false)
    React.useEffect(() => {
        const reached = p >= 0.999 || (rectBottom <= stickyH + triggerTop + handoffGuardPx + 0.5)
        if (reached && !sentDone.current) {
            sentDone.current = true
            window.dispatchEvent(new CustomEvent('amd_band_done', { detail: { stickyH, topOffset } }))
        }
        if (!reached && sentDone.current) sentDone.current = false
    }, [p, rectBottom, stickyH, triggerTop, handoffGuardPx, topOffset])

    return (
        <section ref={sectionRef as any} style={{ height: trackH, position: 'relative' }}>
            {phase === 'pin' && (
                <div
                    style={{
                        position: 'fixed',
                        top: topOffset, left: 0, right: 0, height: stickyH,
                        zIndex: 9,
                        overflow: 'hidden',
                        background: 'transparent',
                        paddingLeft: 'env(safe-area-inset-left)',
                        paddingRight: 'env(safe-area-inset-right)',
                        willChange: 'auto', // pas de transform dynamique → aucun déplacement
                    }}
                    aria-hidden
                >
                    {/* Révélation par clipPath uniquement */}
                    <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${clipTopPercent}% 0 0 0)` }}>
                        <div style={{ position: 'absolute', inset: 0, background: bandColor }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                            <h2
                                className="m-0"
                                style={{
                                    color: textColor,
                                    fontSize: 'var(--accroche-size, clamp(24px,6vw,64px))',
                                    lineHeight: 1.2,
                                    letterSpacing: '0.015em',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center',
                                    padding: '0 24px',
                                }}
                            >
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Recouvrement (blanc) par scaleY — toujours sur le calque fixe */}
                    {!inReveal && (
                        <div
                            style={{
                                position: 'absolute', inset: 0, background: C.blanc,
                                transform: `scaleY(${coverP})`,
                                transformOrigin: 'bottom',
                                pointerEvents: 'none',
                                willChange: coverP > 0 && coverP < 1 ? 'transform' : 'auto',
                            }}
                        />
                    )}
                </div>
            )}
        </section>
    )
}

/* ──────────────────────────────────────────────────────────────
   StepsStickyReveal — même rendu, calculs sans reflow en scroll
   ────────────────────────────────────────────────────────────── */
function StepsStickyReveal({
    trackVH = 175,                  // un peu plus long pour finir avant la section suivante
    stickyVH = 80,
    thresholds = [0.00, 0.18, 0.38, 0.60], // apparition plus tôt
    fadeWindow = 0.22,                     // fenêtre un poil plus large = +doux
    handoffGuardPx = 8,                    // garde pour éviter le hop
}: {
    trackVH?: number
    stickyVH?: number
    thresholds?: number[]
    fadeWindow?: number
    handoffGuardPx?: number
}) {
    const vh = useVH()
    const trackH = Math.max(1, Math.round((vh * trackVH) / 100))
    const stickyH = Math.max(1, Math.round((vh * stickyVH) / 100))

    // Offsets stables (debounce + hysteresis → pas de micromouvements iOS)
    const topOffset = useStableTopOffset()

    // Handoff quand le bandeau est terminé (on “arme” l’apparition)
    const [armed, setArmed] = React.useState(false)
    React.useEffect(() => {
        const onDone = () => setArmed(true)
        window.addEventListener('amd_band_done', onDone as any)
        return () => window.removeEventListener('amd_band_done', onDone as any)
    }, [])

    // Mesures absolues (hors scroll)
    const trackRef = React.useRef<HTMLDivElement | null>(null)
    const { top: absTop, height: absHeight } = useAbsMetrics(trackRef)

    // Scroll global rAF (unique)
    const y = useRafScroll()

    // Projection sans reflow
    const rectTop = absTop - y
    const rectBottom = rectTop + absHeight

    const total = Math.max(1, absHeight - stickyH)
    const advanced = Math.min(total, Math.max(0, topOffset - rectTop))
    const p = advanced / total

    // Phase avec garde → on “tient” le pin un chouïa plus longtemps
    const phase: 'before' | 'pin' | 'after' =
        (rectTop - topOffset > 0) ? 'before'
            : (rectBottom >= stickyH + topOffset + handoffGuardPx) ? 'pin'
                : 'after'

    const effectiveP = armed ? p : 0
    const ease = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }

    // Positionnement de la couche :
    // - before: absolu en haut
    // - pin: fixed aligné au topOffset
    // - after: absolu, “posé” EXACTEMENT à la fin du pin → plus de saut
    const layerPos: React.CSSProperties =
        phase === 'before'
            ? { position: 'absolute', top: 0, left: 0, right: 0, height: stickyH }
            : phase === 'pin'
                ? {
                    position: 'fixed', top: 0, left: 0, right: 0, height: stickyH,
                    zIndex: 10,
                    transform: `translate3d(0, ${topOffset}px, 0)`,
                    willChange: 'transform',
                    pointerEvents: 'none',
                    background: 'transparent',
                }
                : {
                    // ❗ on “dépose” au même endroit géométrique que la fin du pin
                    position: 'absolute', top: (trackH - stickyH), left: 0, right: 0, height: stickyH
                }

    const steps = [
        { n: '01', t: 'Écoute', d: 'On clarifie vos envies, votre rythme et vos contraintes.' },
        { n: '02', t: 'Conception', d: 'Un itinéraire sur-mesure, pensé pour le bon tempo.' },
        { n: '03', t: 'Organisation', d: 'Transferts, réservations, adresses rares préparées pour vous.' },
        { n: '04', t: 'Accompagnement', d: 'Avant, pendant, après — vous profitez, on s’occupe du reste.' },
    ]

    // Diagonale douce
    const baseShiftY = 22
    const baseShiftX = 18

    return (
        <div
            ref={trackRef}
            style={{ height: trackH, position: 'relative', overflow: 'visible', zIndex: 8, background: 'transparent' }}
        >
            <div style={layerPos} className={phase === 'pin' ? 'fixed-smooth' : undefined}>
                {/* Optionnel : rideau blanc discret pour éviter de voir la section suivante pendant le pin
        {phase === 'pin' && (
          <div style={{position:'absolute', inset:0, background:'#F9F8F6', opacity: 1, pointerEvents:'none'}} />
        )} */}
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
                            const aRaw = Math.max(0, Math.min(1, (effectiveP - thresholds[i]) / fadeWindow))
                            const appear = phase === 'after' ? 1 : ease(aRaw)

                            const centerFactor = i - (steps.length - 1) / 2
                            const dx = (1 - appear) * baseShiftX * centerFactor
                            const dy = (1 - appear) * baseShiftY + i * 32

                            const hidden = appear <= 0.001 && phase !== 'after'
                            return (
                                <div
                                    key={step.n}
                                    className="step-card"
                                    style={{
                                        minWidth: 220,
                                        transform: `translate3d(${dx}px, ${dy}px, 0)`,
                                        opacity: appear,
                                        willChange: appear > 0 && appear < 1 ? 'transform, opacity' : 'auto',
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
   StepsVertical — inchangé (IO déjà fluide)
   ────────────────────────────────────────────────────────────── */
function StepsVertical() {
    const ref = React.useRef<HTMLDivElement | null>(null)
    const [visible, setVisible] = useState<boolean[]>(new Array(4).fill(false))

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const items = Array.from(el.querySelectorAll('[data-step]'))
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                const i = Number((e.target as HTMLElement).dataset.stepIndex || -1)
                if (i >= 0 && e.isIntersecting) {
                    setVisible(prev => { if (prev[i]) return prev; const cp = prev.slice(); cp[i] = true; return cp })
                }
            })
        }, { rootMargin: '0px 0px -15% 0px', threshold: 0.2 })
        items.forEach(it => io.observe(it))
        return () => io.disconnect()
    }, [])

    const steps = [
        { n: '01', t: 'Écoute', d: 'On clarifie vos envies, votre rythme et vos contraintes.' },
        { n: '02', t: 'Conception', d: 'Un itinéraire sur-mesure, pensé pour le bon tempo.' },
        { n: '03', t: 'Organisation', d: 'Transferts, réservations, adresses rares préparées pour vous.' },
        { n: '04', t: 'Accompagnement', d: 'Avant, pendant, après — vous profitez, on s’occupe du reste.' },
    ]

    return (
        <section ref={ref} style={{ padding: '36px 16px 12px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                {steps.map((s, i) => {
                    const on = visible[i]
                    return (
                        <div
                            key={s.n}
                            data-step
                            data-step-index={i}
                            style={{
                                opacity: on ? 1 : 0,
                                transform: `translateY(${on ? 0 : 12}px)`,
                                transition: 'opacity .28s ease, transform .28s ease',
                                willChange: 'auto',
                                background: 'transparent',
                                padding: '14px 4px',
                            }}
                        >
                            <h3 className="m-0" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.cuivre, marginBottom: 6 }}>
                                {s.n}. {s.t}
                            </h3>
                            <p className="m-0 font-sans" style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(90,51,23,.95)' }}>
                                {s.d}
                            </p>
                            <div style={{ height: 10 }} />
                            <div style={{ height: 1, background: 'rgba(90,51,23,.12)' }} />
                        </div>
                    )
                })}
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
    const y = useRafScroll()

    const A = 'Vivez une expérience unique'
    const B = 'à travers le monde.'

    const REVEAL_SPAN = Math.round(heroH * 1.0)
    const revealP = clamp01((Math.max(0, y - heroH) / Math.max(1, REVEAL_SPAN)))

    const abRef = useRef<HTMLDivElement | null>(null)
    const [accH, setAccH] = useState(0)
    useLayoutEffect(() => {
        const measure = () => {
            if (!abRef.current) return
            const r = abRef.current.getBoundingClientRect()
            setAccH(Math.ceil(r.height))
        }
        measure()
        window.addEventListener('resize', measure, { passive: true })
        return () => window.removeEventListener('resize', measure)
    }, [vh])

    const GAP_VH = 25
    const GAP_PX = (vh * GAP_VH) / 100

    const startY = Math.max(0, (heroH - accH) / 2)
    const targetY = -accH - GAP_PX
    const DIST = Math.max(1, startY - targetY)
    const HANDOFF_SPAN = DIST
    const handoffP = clamp01(((Math.max(0, y - heroH) - REVEAL_SPAN) / HANDOFF_SPAN))
    const currentY = startY + handoffP * (targetY - startY)
    const fadeOutA = 1 - clamp01((handoffP - 0.85) / 0.15)
    const handoffDone = handoffP >= 0.999
    const PAGE_PAD = REVEAL_SPAN + HANDOFF_SPAN
    const EXTRA_GAP_PX = Math.round((vh * 12) / 100)
    const bp = useBreakpoint()

    return (
        <div className="font-[Cormorant_Garamond]" style={{ color: C.taupe, background: C.blanc, margin: 0, overflowX: 'hidden' }}>
            <GlobalStyles />
            <MobileGlobalCSS />

            {/* espace réservé au HERO */}
            <div style={{ height: heroH }} />

            {/* HERO fixe (identique visuellement) */}
            {!handoffDone && (
                <div
                    style={{ position: 'fixed', inset: '0 0 auto 0', height: heroH, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
                    aria-hidden
                    className="isolate"
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
                    {/* cover piloté par y / heroH — identique mais sans écouteur scroll dédié */}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: clamp01(y / Math.max(1, heroH)) * heroH, background: C.blanc }} />
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
                    <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px,4vw,56px)', rowGap: 'clamp(28px,5vw,72px)', flexWrap: 'wrap', marginBottom: 'clamp(28px,6vw,72px)' }}>
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
                                className="bg-cover-center cv-auto"
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
                            className="bg-cover-center cv-auto"
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
                    durationVH={bp.isPhone ? 110 : bp.isTablet ? 125 : 140}
                    triggerAdvanceVH={bp.isPhone ? 16 : 22}
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
                    className="bg-cover-center cv-auto"
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
