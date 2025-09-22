import apiService from './api'

export interface Process {
  id: number
  number: string
  title: string
  type: string
  status: string
  priority: string
  assignee_id?: number
  assignee_name?: string
  created_date: string
  due_date?: string
  progress: number
  client_name?: string
  value?: number
  description?: string
}

export interface ProcessCreate {
  number: string
  title: string
  type: string
  status?: string
  priority?: string
  assignee_id?: number
  due_date?: string
  client_name?: string
  value?: number
  description?: string
}

export interface ProcessUpdate {
  title?: string
  type?: string
  status?: string
  priority?: string
  assignee_id?: number
  due_date?: string
  client_name?: string
  value?: number
  description?: string
  progress?: number
}

export interface ProcessListResponse {
  processes: Process[]
  total: number
  page: number
  per_page: number
}

class ProcessService {
  private baseUrl = '/processes'

  async getProcesses(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ProcessListResponse> {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
      ...(search && { search })
    })

    const response = await apiService.get<ProcessListResponse>(
      `${this.baseUrl}?${params}`
    )
    return response
  }

  async getProcess(id: number): Promise<Process> {
    const response = await apiService.get<Process>(`${this.baseUrl}/${id}`)
    return response
  }

  async createProcess(processData: ProcessCreate): Promise<Process> {
    const response = await apiService.post<Process>(this.baseUrl, processData)
    return response
  }

  async updateProcess(id: number, processData: ProcessUpdate): Promise<Process> {
    const response = await apiService.put<Process>(`${this.baseUrl}/${id}`, processData)
    return response
  }

  async deleteProcess(id: number): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`)
  }

  async getMyProcesses(
    page: number = 1,
    limit: number = 10
  ): Promise<ProcessListResponse> {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString()
    })

    const response = await apiService.get<ProcessListResponse>(
      `${this.baseUrl}/my?${params}`
    )
    return response
  }
}

export const processService = new ProcessService()


