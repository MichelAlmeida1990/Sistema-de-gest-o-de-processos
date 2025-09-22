import apiService from './api'

export interface Task {
  id: number
  title: string
  description?: string
  type: string
  status: string
  priority: string
  assignee_id?: number
  assignee_name?: string
  process_id?: number
  process_number?: string
  created_date: string
  due_date?: string
  progress: number
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
}

export interface TaskCreate {
  title: string
  description?: string
  type: string
  status?: string
  priority?: string
  assignee_id?: number
  process_id?: number
  due_date?: string
  estimated_hours?: number
  tags?: string[]
}

export interface TaskUpdate {
  title?: string
  description?: string
  type?: string
  status?: string
  priority?: string
  assignee_id?: number
  due_date?: string
  progress?: number
  actual_hours?: number
  tags?: string[]
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  per_page: number
}

class TaskService {
  private baseUrl = '/tasks'

  async getTasks(
    page: number = 1,
    limit: number = 10,
    status?: string,
    assignee_id?: number
  ): Promise<TaskListResponse> {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(assignee_id && { assignee_id: assignee_id.toString() })
    })

    const response = await apiService.get<TaskListResponse>(
      `${this.baseUrl}?${params}`
    )
    return response
  }

  async getTask(id: number): Promise<Task> {
    const response = await apiService.get<Task>(`${this.baseUrl}/${id}`)
    return response
  }

  async createTask(taskData: TaskCreate): Promise<Task> {
    const response = await apiService.post<Task>(this.baseUrl, taskData)
    return response
  }

  async updateTask(id: number, taskData: TaskUpdate): Promise<Task> {
    const response = await apiService.put<Task>(`${this.baseUrl}/${id}`, taskData)
    return response
  }

  async deleteTask(id: number): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`)
  }

  async getTasksByProcess(processId: number): Promise<Task[]> {
    const response = await apiService.get<Task[]>(`${this.baseUrl}/process/${processId}`)
    return response
  }

  async getMyTasks(
    page: number = 1,
    limit: number = 10
  ): Promise<TaskListResponse> {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString()
    })

    const response = await apiService.get<TaskListResponse>(
      `${this.baseUrl}/my?${params}`
    )
    return response
  }
}

export const taskService = new TaskService()



