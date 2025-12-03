// ===========================================
// CONFIGURAÇÕES DE AMBIENTE
// ===========================================

export const config = {
  // API
  API_BASE_URL: import.meta.env.VITE_API_URL || 
                import.meta.env.VITE_API_BASE_URL || 
                'http://localhost:8000/api/v1',
  
  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Sistema de Gestão de Processos',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  
  // Debug
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.MODE === 'development',
  
  // URLs
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || window.location.origin,
  
  // WebSocket (ajustável para produção)
  WS_URL: import.meta.env.VITE_WS_URL || 
          (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws'),
  
  // Features (podem ser desabilitadas via env vars)
  FEATURES: {
    ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA !== 'false',
    ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    ENABLE_FILE_UPLOAD: import.meta.env.VITE_ENABLE_FILE_UPLOAD !== 'false',
    ENABLE_REPORTS: import.meta.env.VITE_ENABLE_REPORTS !== 'false',
    ENABLE_TIMELINE: import.meta.env.VITE_ENABLE_TIMELINE !== 'false',
    ENABLE_WEBSOCKET: import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false'
  }
}

// Função helper para obter URL da API
export function getApiUrl(): string {
  return config.API_BASE_URL
}

export default config





