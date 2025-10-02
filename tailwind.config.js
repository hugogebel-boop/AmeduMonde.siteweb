import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        taupe: '#7E7266',
        blanc: '#F9F8F6',
        sable: '#EAD9B5',
        ocre:  '#D98C4B',
        bleu:  '#6E90A6',
        noir:  '#121212',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config
