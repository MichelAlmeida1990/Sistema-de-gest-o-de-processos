/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WS_URL?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_FRONTEND_URL?: string
  readonly VITE_DEBUG?: string
  readonly VITE_ENABLE_2FA?: string
  readonly VITE_ENABLE_NOTIFICATIONS?: string
  readonly VITE_ENABLE_FILE_UPLOAD?: string
  readonly VITE_ENABLE_REPORTS?: string
  readonly VITE_ENABLE_TIMELINE?: string
  readonly VITE_ENABLE_WEBSOCKET?: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
