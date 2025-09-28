// ===========================================
// CONFIGURAÇÃO DA API
// ===========================================

import config from '../config/env'

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
import { getMobileConfig, isMobile } from '../utils/mobile'

class ApiService {
  private api: AxiosInstance
  private token: string | null = null

  constructor() {
    const mobileConfig = getMobileConfig()
    
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: mobileConfig.timeout, // Timeout dinâmico baseado na conexão
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...(isMobile() && {
          'User-Agent': navigator.userAgent,
          'X-Requested-With': 'XMLHttpRequest',
          'X-Forwarded-For': '192.168.0.16',
          'X-Real-IP': '192.168.0.16'
        })
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
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          this.clearToken()
          // Só redirecionar se não estiver na página de login e não for uma requisição de login
          if (window.location.pathname !== '/login' && !error.config?.url?.includes('/auth/login')) {
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
    this.token = localStorage.getItem('token')
  }

  public setToken(token: string): void {
    this.token = token
    localStorage.setItem('token', token)
  }

  public clearToken(): void {
    this.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  public getToken(): string | null {
    if (this.token) {
      return this.token
    }
    
    // Buscar do localStorage
    const storedToken = localStorage.getItem('token')
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
