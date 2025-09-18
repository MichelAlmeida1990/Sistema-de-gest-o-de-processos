// ===========================================
// SERVIÇO DE AUTENTICAÇÃO
// ===========================================

import apiService from './api'
import { debugLogger, debugLocalStorage } from '../utils/debug'

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
    debugLogger.log('AUTH_SERVICE', 'LOGIN_START', { email: credentials.email })
    debugLocalStorage()
    
    try {
      debugLogger.log('AUTH_SERVICE', 'MAKING_REQUEST', { url: 'http://localhost:8000/api/v1/auth/login' })
      
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          totp_code: credentials.totp_code
        })
      })
      
      debugLogger.log('AUTH_SERVICE', 'RESPONSE_RECEIVED', { 
        status: response.status, 
        ok: response.ok 
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        debugLogger.log('AUTH_SERVICE', 'LOGIN_ERROR', { status: response.status, error: errorText })
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      debugLogger.log('AUTH_SERVICE', 'RESPONSE_DATA', data)
      
      // Salvar dados diretamente - assumir que a resposta tem a estrutura correta
      const token = data.access_token || data.token?.access_token || data.token
      const user = data.user
      
      debugLogger.log('AUTH_SERVICE', 'EXTRACTING_DATA', { 
        hasToken: !!token, 
        hasUser: !!user,
        tokenType: typeof token,
        userType: typeof user
      })
      
      if (!token) {
        debugLogger.log('AUTH_SERVICE', 'TOKEN_NOT_FOUND', data)
        throw new Error('Token não encontrado na resposta')
      }
      
      if (!user) {
        debugLogger.log('AUTH_SERVICE', 'USER_NOT_FOUND', data)
        throw new Error('Usuário não encontrado na resposta')
      }
      
      // Salvar dados
      debugLogger.log('AUTH_SERVICE', 'SAVING_DATA', { tokenLength: token.length })
      localStorage.setItem('current_user', JSON.stringify(user))
      apiService.setToken(token)
      
      debugLogger.log('AUTH_SERVICE', 'DATA_SAVED', {
        userSaved: !!localStorage.getItem('current_user'),
        tokenSaved: !!localStorage.getItem('auth_token')
      })
      
      this.currentUser = user
      debugLogger.log('AUTH_SERVICE', 'LOGIN_SUCCESS', { userId: user.id, email: user.email })
      
      return {
        access_token: token,
        refresh_token: data.refresh_token || data.token?.refresh_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in,
        user: user
      }
      
    } catch (error: any) {
      debugLogger.log('AUTH_SERVICE', 'LOGIN_ERROR', { error: error.message })
      throw error
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
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('current_user')
    
    console.log('=== VERIFICAÇÃO DE AUTENTICAÇÃO ===')
    console.log('Token existe:', !!token)
    console.log('User existe:', !!user)
    console.log('Token length:', token?.length || 0)
    
    const isAuth = !!(token && user)
    console.log('Resultado final:', isAuth)
    
    return isAuth
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
