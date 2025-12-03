import axios from 'axios'
import config from '../config/env'

const API_URL = config.API_BASE_URL

export interface DeadlineCalculationRequest {
  data_inicial: string
  numero_dias: number
  tipo_prazo: 'dias_uteis' | 'dias_corridos'
  tribunal?: string | null
  incluir_feriados?: boolean
  incluir_suspensoes?: boolean
}

export interface DeadlineCalculationResponse {
  success: boolean
  data_inicial: string
  data_final: string
  numero_dias: number
  tipo_prazo: string
  tribunal?: string | null
  dias_totais: number
  dias_uteis: number
  feriados_considerados: boolean
  suspensoes_consideradas: boolean
  timestamp: string
}

class DeadlineService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  async calculateDeadline(
    request: DeadlineCalculationRequest
  ): Promise<DeadlineCalculationResponse> {
    const response = await axios.post(
      `${API_URL}/deadlines/calculate`,
      request,
      { headers: this.getAuthHeaders() }
    )
    return response.data
  }

  async getHolidays(ano: number, tribunal?: string) {
    const response = await axios.get(
      `${API_URL}/deadlines/holidays/${ano}`,
      {
        params: { tribunal },
        headers: this.getAuthHeaders() }
    )
    return response.data
  }

  async validateDate(data: string, tribunal?: string) {
    const response = await axios.get(
      `${API_URL}/deadlines/validate-date`,
      {
        params: { data, tribunal },
        headers: this.getAuthHeaders() }
    )
    return response.data
  }
}

export const deadlineService = new DeadlineService()

