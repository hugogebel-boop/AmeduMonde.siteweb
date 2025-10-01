import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: change `base` to your repo name when deploying to GitHub Pages, e.g. '/amedumonde-site/'
export default defineConfig({
  plugins: [react()],
  base: '/', // replace with '/<repo-name>/' before deploying to GH Pages if using project pages
})
