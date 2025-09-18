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
  two_factor_enabled: boolean
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
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials)
      
      // Salvar token
      apiService.setToken(response.access_token)
      
      // Salvar dados do usuário
      this.currentUser = response.user
      localStorage.setItem('current_user', JSON.stringify(response.user))
      
      return response
    } catch (error: any) {
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
      this.currentUser = null
      localStorage.removeItem('current_user')
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
    return !!apiService.getToken() && !!this.getStoredUser()
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
