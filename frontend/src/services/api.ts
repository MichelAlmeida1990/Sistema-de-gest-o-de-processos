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
          'X-Requested-With': 'XMLHttpRequest',
          'X-Forwarded-For': '192.168.0.16',
          'X-Real-IP': '192.168.0.16'
        })
      },
    })

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        // Sempre verificar o token antes de fazer a requisição
        const currentToken = this.getToken()
        console.log('🔍 Verificando token para:', config.url)
        console.log('🔑 Token encontrado:', currentToken ? 'SIM' : 'NÃO')
        
        if (currentToken && currentToken !== 'undefined' && currentToken !== 'null') {
          config.headers.Authorization = `Bearer ${currentToken}`
          console.log('✅ Token enviado:', currentToken.substring(0, 20) + '...')
        } else {
          console.log('❌ Nenhum token válido encontrado para a requisição:', config.url)
          console.log('🔍 Token atual:', currentToken)
          // Se não há token e não é uma requisição de login, mostrar alerta em vez de redirecionar
          if (!config.url?.includes('/auth/login') && !config.url?.includes('/health')) {
            console.log('⚠️ SEM TOKEN VÁLIDO - Requisição será rejeitada pelo servidor')
            console.log('🔍 Aguarde para ver o erro 401...')
            // Não redirecionar automaticamente - deixar o erro 401 acontecer
          }
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
        console.log('✅ Resposta recebida:', response.status, response.config.url)
        return response
      },
      (error) => {
        console.log('❌ Erro na resposta:', error.response?.status, error.config?.url)
        if (error.response?.status === 401) {
          console.log('🚫 Erro 401 - Token inválido ou expirado')
          console.log('🔍 URL que causou o erro:', error.config?.url)
          console.log('🔍 Headers enviados:', error.config?.headers)
          
          // Verificar se é realmente um erro de autenticação ou se é um problema de configuração
          const currentToken = this.getToken()
          if (currentToken) {
            console.log('⚠️ Token existe mas foi rejeitado pelo servidor')
            console.log('🔑 Token atual:', currentToken.substring(0, 20) + '...')
            console.log('🔍 Possíveis causas:')
            console.log('   - Token expirado')
            console.log('   - Token malformado')
            console.log('   - Problema no backend')
            console.log('   - Headers incorretos')
          } else {
            console.log('⚠️ Nenhum token encontrado durante erro 401')
            console.log('🔍 Possíveis causas:')
            console.log('   - Token não foi salvo após login')
            console.log('   - Token foi limpo incorretamente')
            console.log('   - Problema no localStorage')
          }
          
          // Mostrar alerta em vez de redirecionar automaticamente
          console.log('🛑 ERRO 401 DETECTADO - Verifique os logs acima')
          console.log('🔄 Para redirecionar manualmente, execute: window.location.href = "/login"')
          
          // Token expirado ou inválido
          this.clearToken()
          
          // Não redirecionar automaticamente - deixar o usuário ver os logs
          // window.location.href = '/login'
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
    console.log('🧹 Limpando token...')
    this.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('✅ Token limpo do localStorage')
  }

  public getToken(): string | null {
    // Sempre verificar o localStorage primeiro
    const storedToken = localStorage.getItem('token')
    console.log('🔍 Token no localStorage:', storedToken ? 'EXISTE' : 'NÃO EXISTE')
    console.log('🔍 Valor do token:', storedToken)
    
    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      this.token = storedToken
      console.log('✅ Token válido encontrado:', storedToken.substring(0, 20) + '...')
      return storedToken
    }
    
    // Limpar token se não existir no localStorage ou for inválido
    console.log('❌ Token inválido ou não encontrado')
    this.token = null
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
