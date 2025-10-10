// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Config optimisée pour un domaine custom (ex: amedumonde.ch)
export default defineConfig({
    plugins: [react()],
    base: "/", // ton domaine pointe à la racine (ex: amedumonde.ch)
    server: {
        port: 5173,
        open: true, // ouvre le site dans le navigateur au démarrage
        host: true, // autorise l’accès depuis d’autres appareils sur le réseau local
    },
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: false, // tu peux le passer à true si tu veux déboguer en prod
        chunkSizeWarningLimit: 800, // évite les faux warnings
        rollupOptions: {
            output: {
                manualChunks: undefined, // meilleur split automatique pour petit site
            },
        },
    },
    optimizeDeps: {
        include: ["framer-motion", "react", "react-dom"],
    },
    esbuild: {
        legalComments: "none",
    },
});
