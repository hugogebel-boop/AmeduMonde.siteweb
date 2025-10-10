// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx}',
    ],
    darkMode: ['class'], // optionnel, tu peux laisser 'media' ou retirer si non utilisé
    theme: {
        container: {
            center: true,
            padding: { DEFAULT: 'clamp(16px,3vw,28px)' },
            screens: { '2xl': '1200px' }, // cohérent avec --container
        },
        extend: {
            colors: {
                sable: '#1b120b',
                taupe: '#5a3317',
                ocre: '#9c541e',
                blanc: '#F9F8F6',
                noir: '#121212',
                bleu: '#102A43',
            },
            fontFamily: {
                serif: ['Cormorant Garamond', 'serif'],
                sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            screens: {
                xs: '480px',
                sm: '640px',
                md: '768px',
                lg: '960px',   // aligne avec tes splits desktop
                xl: '1200px',
            },
            spacing: {
                '2xs': '8px',
                xs: '14px',
                sm: '22px',
                base: '56px',
                lg: '88px',
                xl: '120px',
            },
            boxShadow: {
                soft: '0 6px 24px rgba(0,0,0,0.06)',
                card: '0 4px 18px rgba(0,0,0,0.04)',
                lift: '0 12px 28px rgba(0,0,0,0.12)',
            },
            borderRadius: {
                xl: '16px',
                '2xl': '20px',
                pill: '999px',
            },
            transitionTimingFunction: {
                easeOutExpo: 'cubic-bezier(0.22,1,0.36,1)',
            },
        },
    },
    plugins: [],
} satisfies Config
