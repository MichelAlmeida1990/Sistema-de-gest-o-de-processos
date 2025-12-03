import apiService from './api'

export interface JurisprudenceCreate {
  title: string
  full_text: string
  process_number?: string
  tribunal?: string
  court?: string
  decision_date?: string
}

export interface Jurisprudence {
  id: number
  process_number?: string
  tribunal?: string
  court?: string
  decision_date?: string
  title: string
  full_text?: string
  summary?: string
  keywords?: string[]
  ai_analysis?: any
  key_points?: string[]
  legal_basis?: string[]
  arguments?: string[]
  similar_cases?: any[]
  comparison_analysis?: any
  status: string
  user_id?: number
  created_at: string
  updated_at: string
}

export interface CompareRequest {
  text1: string
  text2: string
  title1?: string
  title2?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ChatRequest {
  message: string
  context?: string
  history?: ChatMessage[]
}

export interface ChatResponse {
  response: string
  timestamp: string
}

class JurisprudenceService {
  private readonly basePath = '/jurisprudence'

  async analyzeJurisprudence(data: JurisprudenceCreate): Promise<Jurisprudence> {
    const response = await apiService.post<Jurisprudence>(`${this.basePath}/analyze`, data)
    return response
  }

  async summarizeDecision(text: string): Promise<{ success: boolean; summary: string }> {
    const response = await apiService.post<{ success: boolean; summary: string }>(
      `${this.basePath}/summarize`,
      { text }
    )
    return response
  }

  async compareJurisprudences(data: CompareRequest): Promise<any> {
    const response = await apiService.post<any>(`${this.basePath}/compare`, data)
    return response
  }

  async generateArguments(
    caseDescription: string,
    jurisprudenceText?: string
  ): Promise<{ success: boolean; arguments: string[] }> {
    const response = await apiService.post<{ success: boolean; arguments: string[] }>(
      `${this.basePath}/generate-arguments`,
      {
        case_description: caseDescription,
        jurisprudence_text: jurisprudenceText
      }
    )
    return response
  }

  async chatWithAI(data: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await apiService.post<ChatResponse>(`${this.basePath}/chat`, data)
      return response
    } catch (error: any) {
      console.error('Erro no chatWithAI:', error)
      // Se houver erro, retornar uma resposta de erro amigável
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw error
    }
  }

  async listJurisprudences(skip: number = 0, limit: number = 100): Promise<Jurisprudence[]> {
    const params = new URLSearchParams()
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())

    const response = await apiService.get<Jurisprudence[]>(
      `${this.basePath}/?${params.toString()}`
    )
    return response
  }

  async getJurisprudence(id: number): Promise<Jurisprudence> {
    const response = await apiService.get<Jurisprudence>(`${this.basePath}/${id}`)
    return response
  }

  async reanalyzeJurisprudence(id: number): Promise<Jurisprudence> {
    const response = await apiService.post<Jurisprudence>(
      `${this.basePath}/${id}/reanalyze`
    )
    return response
  }
}

export const jurisprudenceService = new JurisprudenceService()

