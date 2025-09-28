// ===========================================
// UTILITÁRIOS PARA MOBILE
// ===========================================

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isSlowConnection = (): boolean => {
  // @ts-ignore - navigator.connection pode não existir em todos os browsers
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  if (!connection) return false
  
  // Verificar se é conexão lenta
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.downlink < 1
}

export const getMobileConfig = () => {
  return {
    timeout: isSlowConnection() ? 60000 : 30000, // 60s para conexão lenta
    retries: 3,
    retryDelay: 2000
  }
}
