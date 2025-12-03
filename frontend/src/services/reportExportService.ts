// ===========================================
// SERVIÇO DE EXPORTAÇÃO DE RELATÓRIOS
// ===========================================

import { apiService } from './api'

export interface ExportParams {
  reportType: string
  startDate?: string
  endDate?: string
  userIds?: string[]
}

export interface ExportResponse {
  message: string
  filename: string
  status: string
}

class ReportExportService {
  /**
   * Exportar relatório para PDF
   */
  async exportToPDF(params: ExportParams): Promise<void> {
    try {
      console.log('📄 Iniciando exportação para PDF...', params)
      
      const queryParams = new URLSearchParams({
        report_type: params.reportType,
        ...(params.startDate && { start_date: params.startDate }),
        ...(params.endDate && { end_date: params.endDate }),
        ...(params.userIds && { user_ids: params.userIds.join(',') })
      })
      
      // Usar o apiService que já gerencia tokens automaticamente
      const response = await apiService.get(`/reports/export/pdf?${queryParams}`, {
        responseType: 'blob'
      })
      
      // Criar blob do PDF
      const blob = new Blob([response], { type: 'application/pdf' })
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Criar nome do arquivo
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `relatorio_${params.reportType}_${timestamp}.pdf`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('✅ PDF exportado com sucesso:', filename)
      
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error)
      throw error
    }
  }
  
  /**
   * Exportar relatório para Excel
   */
  async exportToExcel(params: ExportParams): Promise<ExportResponse> {
    try {
      console.log('📊 Iniciando exportação para Excel...', params)
      
      const queryParams = new URLSearchParams({
        report_type: params.reportType,
        ...(params.startDate && { start_date: params.startDate }),
        ...(params.endDate && { end_date: params.endDate }),
        ...(params.userIds && { user_ids: params.userIds.join(',') })
      })
      
      const response = await apiService.get<ExportResponse>(`/reports/export/excel?${queryParams}`)
      
      console.log('✅ Excel exportado com sucesso:', response.filename)
      return response
      
    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error)
      throw error
    }
  }
  
  /**
   * Exportar relatório para CSV
   */
  async exportToCSV(params: ExportParams): Promise<ExportResponse> {
    try {
      console.log('📋 Iniciando exportação para CSV...', params)
      
      const queryParams = new URLSearchParams({
        report_type: params.reportType,
        ...(params.startDate && { start_date: params.startDate }),
        ...(params.endDate && { end_date: params.endDate }),
        ...(params.userIds && { user_ids: params.userIds.join(',') })
      })
      
      const response = await apiService.get<ExportResponse>(`/reports/export/csv?${queryParams}`)
      
      console.log('✅ CSV exportado com sucesso:', response.filename)
      return response
      
    } catch (error) {
      console.error('❌ Erro ao exportar CSV:', error)
      throw error
    }
  }
}

export const reportExportService = new ReportExportService()
export default reportExportService
