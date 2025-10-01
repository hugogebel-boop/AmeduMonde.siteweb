# Âme du Monde — Vite + React + TS + Tailwind

## Démarrer en local
```bash
npm install
npm run dev
```
Ouvre http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Déployer sur GitHub Pages (projet *Pages*)
1. Crée un repo GitHub et pousse ce dossier.
2. Dans `vite.config.ts`, change `base` en `'/<nom-du-repo>/'` (par ex. `/amedumonde/`). Commit.
3. Configure Pages: Settings → Pages → Source: **GitHub Actions** (recommandé) **ou** utilise le script `gh-pages` ci-dessous.
4. Avec `gh-pages` (facile) :
   ```bash
   npm run deploy
   ```
   Ça publie `dist/` sur la branche `gh-pages`. Va dans Settings → Pages et sélectionne la branche `gh-pages` si besoin.

### Option GitHub Actions (recommandée)
Crée `.github/workflows/deploy.yml` avec :
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

> **Important** : `base` dans `vite.config.ts` doit matcher `/<nom-du-repo>/` pour les assets en prod.

## Personnaliser
- Police : Google Fonts (Cormorant Garamond + Raleway) incluses dans `index.html`.
- Couleurs/texte : modifie `src/AccueilV9.tsx`.
- Tailwind : `tailwind.config.js` + `src/index.css`.

---

Made with ❤️
