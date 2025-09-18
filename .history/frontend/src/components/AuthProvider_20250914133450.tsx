import React, { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkToken } = useAuthStore()

  useEffect(() => {
    // Verificar token ao carregar a aplicação
    try {
      checkToken()
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    }
  }, [checkToken])

  return <>{children}</>
}

