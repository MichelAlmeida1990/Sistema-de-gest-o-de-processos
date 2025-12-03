import apiService from './api'

export interface DiagnosisCreate {
  client_name: string
  case_description: string
  client_email?: string
  client_phone?: string
  client_document?: string
  case_category?: string
  case_type?: string
}

export interface Diagnosis {
  id: number
  client_name: string
  client_email?: string
  client_phone?: string
  client_document?: string
  case_description: string
  case_category?: string
  case_type?: string
  ai_analysis?: any
  key_issues?: string[]
  possible_solutions?: string[]
  success_probability?: number
  risk_level?: string
  recommendations?: string
  estimated_value?: number
  estimated_duration?: string
  status: string
  priority: string
  consultation_scheduled: boolean
  consultation_date?: string
  user_id?: number
  created_at: string
  updated_at: string
}

export interface DiagnosisListResponse {
  diagnoses: Diagnosis[]
  total: number
  page: number
  per_page: number
}

export interface AnalyzeTextRequest {
  text: string
  category?: string
  case_type?: string
}

class LegalDiagnosisService {
  private readonly basePath = '/legal-diagnosis'

  async createDiagnosis(data: DiagnosisCreate): Promise<Diagnosis> {
    const response = await apiService.post<Diagnosis>(`${this.basePath}/`, data)
    return response
  }

  async listDiagnoses(
    skip: number = 0,
    limit: number = 100,
    status?: string
  ): Promise<DiagnosisListResponse> {
    const params = new URLSearchParams()
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())
    if (status) params.append('status', status)

    const response = await apiService.get<DiagnosisListResponse>(
      `${this.basePath}/?${params.toString()}`
    )
    return response
  }

  async getDiagnosis(id: number): Promise<Diagnosis> {
    const response = await apiService.get<Diagnosis>(`${this.basePath}/${id}`)
    return response
  }

  async reanalyzeDiagnosis(id: number): Promise<Diagnosis> {
    const response = await apiService.post<Diagnosis>(
      `${this.basePath}/${id}/analyze`
    )
    return response
  }

  async analyzeText(data: AnalyzeTextRequest): Promise<any> {
    const response = await apiService.post<any>(
      `${this.basePath}/analyze-text`,
      data
    )
    return response
  }
}

export const legalDiagnosisService = new LegalDiagnosisService()



