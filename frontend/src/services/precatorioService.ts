import apiService, { PaginatedResponse } from './api'

export interface Precatorio {
  id: number
  numero: string
  processo_origem?: string
  tribunal?: string
  ente_devedor: string
  natureza: string
  status: string
  data_inscricao?: string
  ano_orcamento?: number
  valor_origem: number
  valor_atualizado?: number
  moeda: string
  cliente_nome: string
  cliente_documento?: string
  processo_id?: number
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface PrecatorioListResponse {
  items: Precatorio[]
  total: number
}

export interface PrecatorioCreateRequest {
  numero: string
  processo_origem?: string
  tribunal?: string
  ente_devedor: string
  natureza?: string
  status?: string
  data_inscricao?: string
  ano_orcamento?: number
  valor_origem: number
  valor_atualizado?: number
  moeda?: string
  cliente_nome: string
  cliente_documento?: string
  processo_id?: number
  observacoes?: string
}

export interface PrecatorioUpdateRequest {
  status?: string
  valor_atualizado?: number
  ano_orcamento?: number
  observacoes?: string
}

export const precatorioService = {
  async list(params?: { page?: number; per_page?: number; ente_devedor?: string; status?: string }): Promise<PrecatorioListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.per_page) query.append('per_page', String(params.per_page))
    if (params?.ente_devedor) query.append('ente_devedor', params.ente_devedor)
    if (params?.status) query.append('status', params.status)

    const url = `/precatorios/?${query.toString()}`
    return apiService.get<PrecatorioListResponse>(url)
  },

  async create(data: PrecatorioCreateRequest): Promise<Precatorio> {
    return apiService.post<Precatorio>('/precatorios/', data)
  },

  async update(id: number, data: PrecatorioUpdateRequest): Promise<Precatorio> {
    return apiService.put<Precatorio>(`/precatorios/${id}`, data)
  },

  async get(id: number): Promise<Precatorio> {
    return apiService.get<Precatorio>(`/precatorios/${id}`)
  },

  async remove(id: number): Promise<void> {
    await apiService.delete<void>(`/precatorios/${id}`)
  },
}

export default precatorioService



