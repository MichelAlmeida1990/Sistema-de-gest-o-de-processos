// ===========================================
// HOOK PARA DETECÇÃO DE MOBILE
// ===========================================

import { useState, useEffect } from 'react'
import { isMobile } from '../utils/mobile'

export const useMobile = () => {
  const [mobile, setMobile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setMobile(isMobile())
      setLoading(false)
    }

    // Verificar imediatamente
    checkMobile()

    // Verificar novamente após resize
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { mobile, loading }
}
