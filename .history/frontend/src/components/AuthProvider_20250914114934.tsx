import React, { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkToken, setLoading } = useAuthStore()

  useEffect(() => {
    // Verificar token ao carregar a aplicação
    const initAuth = async () => {
      try {
        const isValid = checkToken()
        if (!isValid) {
          // Token inválido ou expirado
          console.log('Token inválido ou expirado')
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [checkToken, setLoading])

  return <>{children}</>
}
