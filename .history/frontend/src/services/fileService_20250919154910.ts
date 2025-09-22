import apiService from './api'

export interface FileItem {
  id: number
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  category?: string
  description?: string
  tags?: string[]
  process_id?: number
  process_number?: string
  uploaded_by: number
  uploader_name?: string
  created_date: string
  updated_date?: string
  is_public: boolean
  download_count: number
}

export interface FileUpload {
  file: File
  category?: string
  description?: string
  tags?: string[]
  process_id?: number
  is_public?: boolean
}

export interface FileListResponse {
  files: FileItem[]
  total: number
  page: number
  per_page: number
}

class FileService {
  private baseUrl = '/files'

  async getFiles(
    page: number = 1,
    limit: number = 20,
    category?: string,
    process_id?: number,
    search?: string
  ): Promise<FileListResponse> {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(process_id && { process_id: process_id.toString() }),
      ...(search && { search })
    })

    const response = await apiService.get<FileListResponse>(
      `${this.baseUrl}?${params}`
    )
    return response
  }

  async getFile(id: number): Promise<FileItem> {
    const response = await apiService.get<FileItem>(`${this.baseUrl}/${id}`)
    return response
  }

  async uploadFile(fileData: FileUpload): Promise<FileItem> {
    const formData = new FormData()
    formData.append('file', fileData.file)
    
    if (fileData.category) formData.append('category', fileData.category)
    if (fileData.description) formData.append('description', fileData.description)
    if (fileData.tags) formData.append('tags', JSON.stringify(fileData.tags))
    if (fileData.process_id) formData.append('process_id', fileData.process_id.toString())
    if (fileData.is_public !== undefined) formData.append('is_public', fileData.is_public.toString())

    const response = await apiService.post<FileItem>(
      this.baseUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response
  }

  async updateFile(id: number, fileData: Partial<FileItem>): Promise<FileItem> {
    const response = await apiService.put<FileItem>(`${this.baseUrl}/${id}`, fileData)
    return response
  }

  async deleteFile(id: number): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`)
  }

  async downloadFile(id: number): Promise<Blob> {
    const response = await apiService.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    })
    return response
  }

  async getFileUrl(id: number): string {
    return `${apiService.getBaseUrl()}${this.baseUrl}/${id}/download`
  }

  async getFilesByProcess(processId: number): Promise<FileItem[]> {
    const response = await apiService.get<FileItem[]>(`${this.baseUrl}/process/${processId}`)
    return response
  }

  async getCategories(): Promise<string[]> {
    const response = await apiService.get<string[]>(`${this.baseUrl}/categories`)
    return response
  }
}

export const fileService = new FileService()


