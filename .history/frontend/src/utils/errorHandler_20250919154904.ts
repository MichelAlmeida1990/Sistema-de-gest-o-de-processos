// ===========================================
// HANDLER GLOBAL DE ERROS
// ===========================================

export const setupGlobalErrorHandlers = () => {
  // Capturar erros JavaScript não tratados
  window.addEventListener('error', (event) => {
    console.error('🚨 GLOBAL ERROR:', event.error)
    console.error('🚨 ERROR DETAILS:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    })
    
    // Salvar erro no localStorage
    const errorData = {
      type: 'javascript_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('global_error', JSON.stringify(errorData))
  })

  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 UNHANDLED PROMISE REJECTION:', event.reason)
    console.error('🚨 PROMISE REJECTION DETAILS:', {
      reason: event.reason,
      stack: event.reason?.stack
    })
    
    // Salvar erro no localStorage
    const errorData = {
      type: 'promise_rejection',
      reason: event.reason?.toString(),
      stack: event.reason?.stack,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('promise_error', JSON.stringify(errorData))
  })

  // Capturar erros de recursos (imagens, scripts, etc.)
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('🚨 RESOURCE ERROR:', {
        target: event.target,
        type: (event.target as any).tagName,
        src: (event.target as any).src || (event.target as any).href
      })
    }
  }, true)

  console.log('✅ Global error handlers setup complete')
}


