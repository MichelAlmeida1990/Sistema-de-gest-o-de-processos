// ===========================================
// CONFIGURAÇÕES DE AMBIENTE
// ===========================================

export const config = {
  // API
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  
  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Sistema de Gestão de Processos',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // Debug
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  
  // Features
  FEATURES: {
    ENABLE_2FA: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_FILE_UPLOAD: true,
    ENABLE_REPORTS: true,
    ENABLE_TIMELINE: true
  }
}

export default config




