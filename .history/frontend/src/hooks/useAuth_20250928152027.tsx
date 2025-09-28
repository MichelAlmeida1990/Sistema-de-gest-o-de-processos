import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { message } from 'antd'
import { websocketService } from '../services/websocketService'

// ===========================================
// TIPOS
// ===========================================

interface User {
  id: number
  email: string
  username: string
  full_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// ===========================================
// CONTEXTO
// ===========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ===========================================
// PROVIDER
// ===========================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há usuário salvo ao carregar
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    
    setIsLoading(false)
  }, [])

  // Conectar WebSocket quando usuário mudar (opcional)
  useEffect(() => {
    if (user && !isLoading) {
      console.log('Tentando conectar WebSocket para usuário:', user.id)
      websocketService.connect(user.id).catch(error => {
        console.warn('WebSocket indisponível (funcionalidade opcional):', error)
        // WebSocket é opcional - sistema funciona sem ele
      })
    } else if (!user) {
      // Desconectar quando não há usuário
      websocketService.disconnect()
    }
  }, [user, isLoading])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Usar configuração dinâmica da API
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.16:8000/api/v1'
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Erro ao fazer login')
      }

      const data = await response.json()
      
      // Salvar dados
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      message.success('Login realizado com sucesso!')
      return true
      
    } catch (error: any) {
      console.error('Erro no login:', error)
      message.error(error.message || 'Erro ao fazer login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Desconectar WebSocket
    websocketService.disconnect()
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    message.success('Logout realizado com sucesso!')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ===========================================
// HOOK
// ===========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}