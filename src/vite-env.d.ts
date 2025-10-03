/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly BASE_URL: string
    readonly MODE: string
    readonly DEV: boolean
    readonly PROD: boolean
    readonly SSR: boolean
    // tes variables custom ici si besoin
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
