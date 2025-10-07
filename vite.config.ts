// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/", // ✅ ton domaine personnalisé pointe à la racine
    build: {
        outDir: "dist",
        sourcemap: false,
    },
    server: {
        port: 5173, // ou celui que tu veux
        open: true,
    },
});
