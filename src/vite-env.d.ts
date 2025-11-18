/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_URL?: string
  readonly VITE_SSE_URL?: string
  readonly VITE_HELIUS_API_KEY?: string
  readonly VITE_HELIUS_API_BASE?: string
  readonly VITE_HELIUS_POLL_MS?: string
  readonly VITE_HELIUS_TX_LIMIT?: string
  readonly VITE_USE_HELIUS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
