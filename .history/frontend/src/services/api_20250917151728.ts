// ===========================================
// CONFIGURAÇÃO DA API
// ===========================================

import config from '../config/env'
import { debugLogger } from '../utils/debug'

const API_BASE_URL = config.API_BASE_URL

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

// ===========================================
// CONFIGURAÇÃO DO AXIOS
// ===========================================

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class ApiService {
  private api: AxiosInstance
  private token: string | null = null

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        debugLogger.log('API_INTERCEPTOR', 'RESPONSE_SUCCESS', { 
          url: response.config.url, 
          status: response.status 
        })
        return response
      },
      (error) => {
        debugLogger.log('API_INTERCEPTOR', 'RESPONSE_ERROR', { 
          url: error.config?.url, 
          status: error.response?.status,
          message: error.message
        })
        
        if (error.response?.status === 401) {
          debugLogger.log('API_INTERCEPTOR', 'UNAUTHORIZED', {
            currentPath: window.location.pathname,
            requestUrl: error.config?.url,
            willRedirect: window.location.pathname !== '/login' && !error.config?.url?.includes('/auth/login')
          })
          
          // Token expirado ou inválido
          this.clearToken()
          // Só redirecionar se não estiver na página de login e não for uma requisição de login
          if (window.location.pathname !== '/login' && !error.config?.url?.includes('/auth/login')) {
            debugLogger.log('API_INTERCEPTOR', 'REDIRECTING_TO_LOGIN')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )

    // Carregar token do localStorage
    this.loadToken()
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token')
    console.log('Loaded token from localStorage:', this.token)
  }

  public setToken(token: string): void {
    debugLogger.log('API_SERVICE', 'SET_TOKEN', { tokenLength: token.length, tokenPreview: token.substring(0, 20) + '...' })
    this.token = token
    localStorage.setItem('auth_token', token)
    debugLogger.log('API_SERVICE', 'TOKEN_SAVED', { 
      saved: !!localStorage.getItem('auth_token'),
      tokenLength: localStorage.getItem('auth_token')?.length || 0
    })
  }

  public clearToken(): void {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  public getToken(): string | null {
    if (this.token) {
      return this.token
    }
    
    // Buscar do localStorage
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      this.token = storedToken
      return storedToken
    }
    
    return null
  }

  // ===========================================
  // MÉTODOS HTTP
  // ===========================================

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  public async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService
