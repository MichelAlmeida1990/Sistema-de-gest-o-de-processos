// ===========================================
// SERVIÇO DE AUTENTICAÇÃO
// ===========================================

import apiService from './api'

// ===========================================
// TIPOS
// ===========================================

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  phone?: string
  role: 'admin' | 'lawyer' | 'assistant' | 'client'
  is_active: boolean
  is_verified: boolean
  is_2fa_enabled: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
  totp_code?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name: string
  phone?: string
  role?: 'admin' | 'lawyer' | 'assistant' | 'client'
}

export interface TwoFactorSetup {
  secret: string
  qr_code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// ===========================================
// SERVIÇO DE AUTENTICAÇÃO
// ===========================================

class AuthService {
  private currentUser: User | null = null

  // ===========================================
  // AUTENTICAÇÃO
  // ===========================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('=== INICIANDO LOGIN ===')
    console.log('Credentials:', { email: credentials.email, hasPassword: !!credentials.password })
    
    try {
      console.log('Fazendo requisição para /auth/login...')
      const response = await apiService.post<any>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        totp_code: credentials.totp_code
      })
      
      console.log('=== RESPOSTA RECEBIDA ===')
      console.log('Response completa:', JSON.stringify(response, null, 2))
      console.log('Response.data:', response.data)
      console.log('Response.token:', response.token)
      console.log('Response.user:', response.user)
      
      // Verificar se a resposta tem a estrutura esperada
      const tokenData = response.token || response.data?.token
      const userData = response.user || response.data?.user
      
      console.log('=== EXTRAINDO DADOS ===')
      console.log('Token data:', tokenData)
      console.log('User data:', userData)
      
      // Salvar token
      if (tokenData?.access_token) {
        console.log('=== SALVANDO TOKEN ===')
        localStorage.setItem('auth_token', tokenData.access_token)
        console.log('Token salvo:', tokenData.access_token.substring(0, 20) + '...')
        console.log('Verificação localStorage:', localStorage.getItem('auth_token')?.substring(0, 20) + '...')
        
        // Atualizar apiService
        apiService.setToken(tokenData.access_token)
        console.log('API Service atualizado')
      } else {
        console.error('=== ERRO: TOKEN NÃO ENCONTRADO ===')
        console.error('Response completa:', response)
        throw new Error('Token não encontrado na resposta do servidor')
      }
      
      // Salvar dados do usuário
      if (userData) {
        console.log('=== SALVANDO USUÁRIO ===')
        this.currentUser = userData
        localStorage.setItem('current_user', JSON.stringify(userData))
        console.log('Usuário salvo:', userData.email)
        console.log('Verificação localStorage usuário:', localStorage.getItem('current_user')?.substring(0, 50) + '...')
      } else {
        console.error('=== ERRO: USUÁRIO NÃO ENCONTRADO ===')
        console.error('Response completa:', response)
        throw new Error('Dados do usuário não encontrados na resposta do servidor')
      }
      
      console.log('=== LOGIN CONCLUÍDO COM SUCESSO ===')
      
      // Retornar no formato esperado
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        user: userData
      }
    } catch (error: any) {
      console.error('=== ERRO NO LOGIN ===')
      console.error('Error:', error)
      console.error('Error response:', error.response)
      throw new Error(error.response?.data?.detail || 'Erro ao fazer login')
    }
  }

  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await apiService.post<User>('/auth/register', userData)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao registrar usuário')
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      // Ignorar erros no logout
    } finally {
      // Limpar dados locais
      apiService.clearToken()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
      this.currentUser = null
      console.log('Logged out, cleared all data')
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/refresh')
      
      // Atualizar token
      apiService.setToken(response.access_token)
      
      return response
    } catch (error: any) {
      // Se falhar, fazer logout
      this.logout()
      throw new Error('Sessão expirada. Faça login novamente.')
    }
  }

  // ===========================================
  // USUÁRIO ATUAL
  // ===========================================

  async getCurrentUser(): Promise<User> {
    try {
      if (this.currentUser) {
        return this.currentUser
      }

      // Buscar do localStorage primeiro
      const storedUser = localStorage.getItem('current_user')
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser)
        return this.currentUser!
      }

      // Buscar da API
      const response = await apiService.get<User>('/auth/me')
      this.currentUser = response
      localStorage.setItem('current_user', JSON.stringify(response))
      
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar usuário atual')
    }
  }

  getStoredUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser)
      return this.currentUser
    }

    return null
  }

  // ===========================================
  // 2FA
  // ===========================================

  async setup2FA(): Promise<TwoFactorSetup> {
    try {
      const response = await apiService.post<TwoFactorSetup>('/auth/2fa/setup')
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao configurar 2FA')
    }
  }

  async verify2FA(code: string): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>('/auth/2fa/verify', { code })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao verificar código 2FA')
    }
  }

  // ===========================================
  // RECUPERAÇÃO DE SENHA
  // ===========================================

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>('/auth/forgot-password', data)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao enviar email de recuperação')
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>('/auth/reset-password', data)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao redefinir senha')
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>('/auth/change-password', data)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao alterar senha')
    }
  }

  // ===========================================
  // UTILITÁRIOS
  // ===========================================

  isAuthenticated(): boolean {
    // Verificar se há token no localStorage
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('current_user')
    
    const hasToken = !!token
    const hasUser = !!user
    
    console.log('Auth check:', { 
      hasToken, 
      hasUser, 
      tokenLength: token?.length || 0, 
      userLength: user?.length || 0 
    })
    
    return hasToken && hasUser
  }

  hasRole(role: string): boolean {
    const user = this.getStoredUser()
    return user?.role === role || user?.role === 'admin'
  }

  isAdmin(): boolean {
    return this.hasRole('admin')
  }

  isLawyer(): boolean {
    return this.hasRole('lawyer') || this.isAdmin()
  }

  clearUser(): void {
    this.currentUser = null
    localStorage.removeItem('current_user')
  }
}

export const authService = new AuthService()
export default authService
