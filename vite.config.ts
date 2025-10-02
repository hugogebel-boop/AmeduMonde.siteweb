// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      base: '/', // pas de sous-chemin en dev
    }
  }

  const repo = process.env.REPO_NAME ?? ''
  const isPages = process.env.GITHUB_PAGES === 'true'
  const isUserOrgPage = repo.endsWith('.github.io')

  return {
    plugins: [react()],
    base: isPages ? (isUserOrgPage || !repo ? '/' : `/${repo}/`) : '/',
  }
})
