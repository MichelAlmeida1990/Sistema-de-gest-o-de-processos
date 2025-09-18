// ===========================================
// SISTEMA DE DEBUG CENTRALIZADO
// ===========================================

class DebugLogger {
  private isEnabled: boolean = true
  private logs: Array<{ timestamp: string, component: string, action: string, data: any }> = []

  log(component: string, action: string, data?: any) {
    if (!this.isEnabled) return

    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, component, action, data }
    
    this.logs.push(logEntry)
    
    // Manter apenas os últimos 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50)
    }

    console.log(`🐛 [${component}] ${action}`, data || '')
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
    console.clear()
  }

  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }
}

export const debugLogger = new DebugLogger()

// Função para debug de localStorage
export const debugLocalStorage = () => {
  const auth_token = localStorage.getItem('auth_token')
  const current_user = localStorage.getItem('current_user')
  
  debugLogger.log('LOCALSTORAGE', 'Current State', {
    hasToken: !!auth_token,
    tokenLength: auth_token?.length || 0,
    tokenPreview: auth_token?.substring(0, 20) + '...' || 'null',
    hasUser: !!current_user,
    userPreview: current_user ? JSON.parse(current_user) : null
  })
}

// Função para debug de autenticação
export const debugAuth = () => {
  debugLocalStorage()
  
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('current_user')
  
  debugLogger.log('AUTH', 'Authentication Check', {
    isAuthenticated: !!(token && user),
    tokenExists: !!token,
    userExists: !!user,
    timestamp: new Date().toISOString()
  })
}
