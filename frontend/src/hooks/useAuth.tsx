import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { message } from 'antd'
import { websocketService } from '../services/websocketService'
import { apiService } from '../services/api'
import { isMobile } from '../utils/mobile'

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
  loginWithToken: (token: string, user: User) => Promise<boolean>
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
    // Em mobile, usar usuário mockado
    if (isMobile()) {
      const mockUser: User = {
        id: 1,
        email: 'mobile@sistema.com',
        username: 'mobile_user',
        full_name: 'Usuário Mobile',
        role: 'mobile'
      }
      setUser(mockUser)
      setIsLoading(false)
      return
    }

    // Em desktop, verificar autenticação normal
    const validateAuth = async () => {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      
      console.log('🔍 Verificando autenticação inicial...')
      console.log('👤 Usuário salvo:', savedUser ? 'SIM' : 'NÃO')
      console.log('🔑 Token salvo:', savedToken ? savedToken.substring(0, 20) + '...' : 'NÃO')
      
      // Limpar tokens inválidos automaticamente
      if (savedToken === 'undefined' || savedToken === 'null' || savedToken === '') {
        console.warn('⚠️ Token inválido detectado! Limpando localStorage...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        apiService.clearToken()
        setUser(null)
        setIsLoading(false)
        return
      }
      
      if (savedUser && savedToken) {
        try {
          // Configurar token no apiService primeiro
          apiService.setToken(savedToken)
          
          // Validar token fazendo uma requisição ao backend
          console.log('🔍 Validando token com o backend...')
          const userData = JSON.parse(savedUser)
          
          // Tentar validar o token fazendo uma requisição ao endpoint /auth/me
          try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json',
              },
            })
            
            if (response.ok) {
              // Token válido - atualizar dados do usuário
              const validatedUser = await response.json()
              setUser(validatedUser)
              localStorage.setItem('user', JSON.stringify(validatedUser))
              apiService.setToken(savedToken)
              console.log('✅ Token válido! Autenticação restaurada com sucesso')
            } else {
              // Token inválido ou expirado - verificar se é token antigo
              const errorData = await response.json().catch(() => ({}))
              console.warn('⚠️ Token inválido ou expirado:', errorData)
              
              // Se for erro 401, provavelmente é token antigo (estrutura incorreta)
              if (response.status === 401) {
                console.log('🔄 Token tem estrutura antiga. Limpando para forçar novo login...')
                localStorage.removeItem('user')
                localStorage.removeItem('token')
                apiService.clearToken()
                setUser(null)
                // Não mostrar mensagem de erro - apenas limpar silenciosamente
                // O usuário será redirecionado para login automaticamente
              } else {
                // Outro tipo de erro
                localStorage.removeItem('user')
                localStorage.removeItem('token')
                apiService.clearToken()
                setUser(null)
              }
            }
          } catch (error) {
            // Erro de rede - verificar se é erro de CORS ou timeout
            console.warn('⚠️ Erro ao validar token:', error)
            
            // Se for erro de rede, tentar usar dados salvos temporariamente
            // Mas marcar como não validado para tentar validar novamente depois
            setUser(userData)
            apiService.setToken(savedToken)
            console.log('⚠️ Usando dados salvos temporariamente (erro de rede)')
          }
        } catch (error) {
          console.error('❌ Erro ao restaurar autenticação:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          apiService.clearToken()
          setUser(null)
        }
      } else {
        // Não há dados salvos
        console.log('❌ Usuário não logado')
        setUser(null)
      }
      
      setIsLoading(false)
    }
    
    validateAuth()
  }, [])

  // Sincronizar token entre abas
  useEffect(() => {
    if (isMobile()) return
    
    // Listener para sincronizar quando o token muda em outra aba
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('🔄 Token alterado em outra aba. Sincronizando...')
        const newToken = e.newValue
        const savedUser = localStorage.getItem('user')
        
        if (newToken && newToken !== 'undefined' && newToken !== 'null') {
          apiService.setToken(newToken)
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              setUser(userData)
              console.log('✅ Sincronização de token concluída')
            } catch (error) {
              console.error('❌ Erro ao sincronizar usuário:', error)
            }
          }
        } else if (newToken === null) {
          // Token foi removido em outra aba
          console.log('🔄 Token removido em outra aba. Deslogando...')
          apiService.clearToken()
          setUser(null)
        }
      }
      
      if (e.key === 'user') {
        console.log('🔄 Usuário alterado em outra aba. Sincronizando...')
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue)
            setUser(userData)
            console.log('✅ Sincronização de usuário concluída')
          } catch (error) {
            console.error('❌ Erro ao sincronizar usuário:', error)
          }
        } else {
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Conectar WebSocket quando usuário mudar (opcional)
  useEffect(() => {
    if (user && !isLoading && !isMobile()) {
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
      
      console.log('📦 Resposta completa do backend:', data)
      console.log('🔑 Estrutura do token:', data.token)
      console.log('👤 Dados do usuário:', data.user)
      
      // Validar estrutura da resposta
      if (!data.token || !data.token.access_token) {
        console.error('❌ Estrutura de resposta inválida:', data)
        throw new Error('Token não encontrado na resposta do servidor')
      }
      
      if (!data.user) {
        console.error('❌ Dados do usuário não encontrados:', data)
        throw new Error('Dados do usuário não encontrados na resposta do servidor')
      }
      
      // Extrair o token
      const accessToken = data.token.access_token
      console.log('✅ Token extraído:', accessToken.substring(0, 20) + '...')
      
      // Salvar dados usando o apiService
      // O backend retorna { user: {...}, token: { access_token: "...", ... } }
      apiService.setToken(accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      // Verificar se o token foi salvo corretamente
      const savedToken = localStorage.getItem('token')
      console.log('🔍 Token salvo no localStorage:', savedToken?.substring(0, 20) + '...')
      
      if (!savedToken || savedToken === 'undefined') {
        console.error('❌ Erro ao salvar token no localStorage')
        throw new Error('Erro ao salvar credenciais')
      }
      
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

  const loginWithToken = async (token: string, userData: User): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Salvar dados usando o apiService
      apiService.setToken(token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      message.success('Login automático realizado!')
      return true
    } catch (error) {
      console.error('Erro no login com token:', error)
      message.error('Erro no login automático')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Desconectar WebSocket
    websocketService.disconnect()
    
    // Limpar token usando o apiService
    apiService.clearToken()
    setUser(null)
    message.success('Logout realizado com sucesso!')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithToken,
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