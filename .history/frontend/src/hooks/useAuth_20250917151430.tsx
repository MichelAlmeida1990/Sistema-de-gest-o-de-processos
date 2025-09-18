// ===========================================
// HOOK DE AUTENTICAÇÃO
// ===========================================

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import authService, { User, LoginRequest, RegisterRequest } from '../services/auth'
import { debugLogger, debugLocalStorage } from '../utils/debug'

// ===========================================
// CONTEXTO DE AUTENTICAÇÃO
// ===========================================

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasRole: (role: string) => boolean
  isAdmin: () => boolean
  isLawyer: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// ===========================================
// PROVIDER DE AUTENTICAÇÃO
// ===========================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    debugLogger.log('USE_AUTH', 'CHECK_AUTH_START')
    debugLocalStorage()
    
    try {
      const isAuth = authService.isAuthenticated()
      debugLogger.log('USE_AUTH', 'AUTH_CHECK_RESULT', { isAuthenticated: isAuth })
      
      if (isAuth) {
        debugLogger.log('USE_AUTH', 'USER_AUTHENTICATED', { action: 'getting_stored_user' })
        const storedUser = authService.getStoredUser()
        if (storedUser) {
          debugLogger.log('USE_AUTH', 'SETTING_USER', { userId: storedUser.id, email: storedUser.email })
          setUser(storedUser)
        } else {
          debugLogger.log('USE_AUTH', 'INCONSISTENT_STATE', { 
            message: 'Token exists but no user found - clearing everything' 
          })
          authService.logout()
        }
      } else {
        debugLogger.log('USE_AUTH', 'USER_NOT_AUTHENTICATED')
      }
    } catch (error) {
      debugLogger.log('USE_AUTH', 'CHECK_AUTH_ERROR', { error: error.message })
      authService.logout()
    } finally {
      debugLogger.log('USE_AUTH', 'CHECK_AUTH_COMPLETE', { isLoading: false })
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    debugLogger.log('USE_AUTH', 'LOGIN_START', { email: credentials.email })
    
    try {
      setIsLoading(true)
      debugLogger.log('USE_AUTH', 'CALLING_AUTH_SERVICE')
      const response = await authService.login(credentials)
      
      debugLogger.log('USE_AUTH', 'LOGIN_SUCCESS', { userId: response.user.id, email: response.user.email })
      setUser(response.user)
      
      debugLogger.log('USE_AUTH', 'NAVIGATING_TO_DASHBOARD')
      message.success('Login realizado com sucesso!')
      navigate('/dashboard')
      
    } catch (error: any) {
      debugLogger.log('USE_AUTH', 'LOGIN_FAILED', { error: error.message })
      message.error(error.message || 'Erro ao fazer login')
      throw error
    } finally {
      debugLogger.log('USE_AUTH', 'LOGIN_COMPLETE')
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      await authService.register(userData)
      message.success('Usuário criado com sucesso!')
    } catch (error: any) {
      message.error(error.message || 'Erro ao registrar usuário')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      message.success('Logout realizado com sucesso!')
      navigate('/login')
    } catch (error: any) {
      message.error(error.message || 'Erro ao fazer logout')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      logout()
    }
  }

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role)
  }

  const isAdmin = (): boolean => {
    return authService.isAdmin()
  }

  const isLawyer = (): boolean => {
    return authService.isLawyer()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    isAdmin,
    isLawyer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ===========================================
// HOOK DE AUTENTICAÇÃO
// ===========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// ===========================================
// HOOK DE AUTORIZAÇÃO
// ===========================================

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  return { isAuthenticated, isLoading }
}

export function useRequireRole(role: string) {
  const { hasRole, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRole(role)) {
      navigate('/unauthorized')
    }
  }, [hasRole, isAuthenticated, isLoading, navigate, role])

  return { hasRole: hasRole(role), isAuthenticated, isLoading }
}

export default useAuth