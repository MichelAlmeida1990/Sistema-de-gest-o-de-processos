// ===========================================
// SERVIÇO DE INTEGRAÇÃO COM API RD STATION
// ===========================================

import axios from 'axios'
import config from '../config/env'

const API_BASE_URL = config.API_BASE_URL

export interface Contact {
  id?: number
  name: string
  email: string
  phone?: string
  company?: string
  tags?: string[]
  custom_fields?: Record<string, any>
}

export interface Deal {
  id?: number
  name: string
  contact_id: number
  company_id?: number
  deal_stage_id: number
  amount?: number
  closed_at?: string
  custom_fields?: Record<string, any>
}

export interface Event {
  event_type: string
  event_family?: string
  payload: Record<string, any>
}

export interface ProcessSyncData {
  client_name: string
  client_email: string
  client_phone?: string
  process_number: string
  status: string
  estimated_value?: number
  type?: string
}

export interface RDStationStatus {
  status: string
  enabled: boolean
  api_token_configured: boolean
  public_token_configured: boolean
  base_url: string
  api_version: string
  last_check: string
  info: string
  documentation: string
}

export interface RDStationResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  contact?: Contact
  deal?: Deal
  webhook?: any
}

class RDStationService {
  private baseURL: string

  constructor() {
    this.baseURL = `${API_BASE_URL}/rdstation`
  }

  /**
   * Verificar status da API RD Station
   */
  async getStatus(): Promise<RDStationStatus> {
    try {
      const response = await axios.get<RDStationResponse<RDStationStatus>>(
        `${this.baseURL}/status`
      )
      return response.data.data!
    } catch (error: any) {
      console.error('Erro ao verificar status RD Station:', error)
      throw error
    }
  }

  /**
   * Criar contato no RD Station
   */
  async createContact(contact: Contact): Promise<Contact> {
    try {
      const response = await axios.post<RDStationResponse<Contact>>(
        `${this.baseURL}/contacts`,
        contact
      )
      return response.data.contact!
    } catch (error: any) {
      console.error('Erro ao criar contato no RD Station:', error)
      throw error
    }
  }

  /**
   * Buscar contato por email
   */
  async getContactByEmail(email: string): Promise<Contact | null> {
    try {
      const response = await axios.get<RDStationResponse<Contact>>(
        `${this.baseURL}/contacts/${email}`
      )
      return response.data.contact || null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('Erro ao buscar contato no RD Station:', error)
      throw error
    }
  }

  /**
   * Atualizar contato no RD Station
   */
  async updateContact(contactId: number, contact: Partial<Contact>): Promise<Contact> {
    try {
      const response = await axios.patch<RDStationResponse<Contact>>(
        `${this.baseURL}/contacts/${contactId}`,
        contact
      )
      return response.data.contact!
    } catch (error: any) {
      console.error('Erro ao atualizar contato no RD Station:', error)
      throw error
    }
  }

  /**
   * Criar oportunidade (deal) no RD Station
   */
  async createDeal(deal: Deal): Promise<Deal> {
    try {
      const response = await axios.post<RDStationResponse<Deal>>(
        `${this.baseURL}/deals`,
        deal
      )
      return response.data.deal!
    } catch (error: any) {
      console.error('Erro ao criar oportunidade no RD Station:', error)
      throw error
    }
  }

  /**
   * Adicionar evento de conversão no RD Station
   */
  async addEvent(event: Event): Promise<boolean> {
    try {
      const response = await axios.post<RDStationResponse>(
        `${this.baseURL}/events`,
        event
      )
      return response.data.success
    } catch (error: any) {
      console.error('Erro ao adicionar evento no RD Station:', error)
      throw error
    }
  }

  /**
   * Sincronizar processo para o RD Station
   */
  async syncProcess(processData: ProcessSyncData): Promise<RDStationResponse> {
    try {
      const response = await axios.post<RDStationResponse>(
        `${this.baseURL}/sync/process`,
        processData
      )
      return response.data
    } catch (error: any) {
      console.error('Erro ao sincronizar processo no RD Station:', error)
      throw error
    }
  }

  /**
   * Criar webhook no RD Station
   */
  async createWebhook(url: string, events: string[]): Promise<any> {
    try {
      const response = await axios.post<RDStationResponse>(
        `${this.baseURL}/webhooks`,
        { url, events }
      )
      return response.data.webhook
    } catch (error: any) {
      console.error('Erro ao criar webhook no RD Station:', error)
      throw error
    }
  }

  /**
   * Obter informações da API RD Station
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await axios.get<RDStationResponse>(
        `${this.baseURL}/api-info`
      )
      return response.data.api_info
    } catch (error: any) {
      console.error('Erro ao obter informações da API RD Station:', error)
      throw error
    }
  }
}

export const rdstationService = new RDStationService()

