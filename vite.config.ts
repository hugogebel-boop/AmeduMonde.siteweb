// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Déploiement GitHub Pages robuste:
 * - En CI (workflow): GITHUB_PAGES=true et REPO_NAME est injecté par Actions
 * - En local/dev: base="/"
 * - Pages utilisateur/organisation (repo se terminant par .github.io): base="/"
 * - Pages de projet: base="/<repo>/"
 */
const repo = process.env.REPO_NAME ?? ''
const isPages = process.env.GITHUB_PAGES === 'true'
const isUserOrgPage = repo.endsWith('.github.io')

export default defineConfig({
  plugins: [react()],
  base: isPages ? (isUserOrgPage || !repo ? '/' : `/${repo}/`) : '/',
  build: {
    sourcemap: true, // utile pour debug si “page blanche”
  },
})
