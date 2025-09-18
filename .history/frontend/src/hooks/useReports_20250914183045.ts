// ===========================================
// HOOK DE RELATÓRIOS
// ===========================================

import { useState, useEffect } from 'react'
import { message } from 'antd'
import reportService, { DashboardStats, ProcessAnalytics, TaskAnalytics, AnalyticsFilters } from '../services/reports'

// ===========================================
// HOOK DE ESTATÍSTICAS DO DASHBOARD
// ===========================================

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await reportService.getDashboardStats()
      setStats(response)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  }
}

// ===========================================
// HOOK DE ANÁLISE DE PROCESSOS
// ===========================================

export function useProcessAnalytics(filters: AnalyticsFilters = {}) {
  const [analytics, setAnalytics] = useState<ProcessAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await reportService.getProcessAnalytics(filters)
      setAnalytics(response)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters.start_date, filters.end_date])

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics
  }
}

// ===========================================
// HOOK DE ANÁLISE DE TAREFAS
// ===========================================

export function useTaskAnalytics(filters: AnalyticsFilters = {}) {
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await reportService.getTaskAnalytics(filters)
      setAnalytics(response)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters.start_date, filters.end_date])

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics
  }
}

// ===========================================
// HOOK DE DADOS PARA GRÁFICOS
// ===========================================

export function useChartData() {
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { analytics: processAnalytics, isLoading: processLoading } = useProcessAnalytics()
  const { analytics: taskAnalytics, isLoading: taskLoading } = useTaskAnalytics()

  const isLoading = statsLoading || processLoading || taskLoading

  // Dados para gráfico de pizza - Status dos Processos
  const processStatusChartData = stats?.processes.by_status.map(item => ({
    name: reportService.getStatusLabel(item.status),
    value: item.count,
    color: reportService.getStatusColor(item.status)
  })) || []

  // Dados para gráfico de pizza - Status das Tarefas
  const taskStatusChartData = stats?.tasks.by_status.map(item => ({
    name: reportService.getStatusLabel(item.status),
    value: item.count,
    color: reportService.getStatusColor(item.status)
  })) || []

  // Dados para gráfico de barras - Processos por Mês
  const monthlyProcessesData = processAnalytics?.monthly.map(item => ({
    month: reportService.formatMonth(item.year, item.month),
    count: item.count
  })) || []

  // Dados para gráfico de barras - Tarefas por Prioridade
  const taskPriorityData = taskAnalytics?.by_priority.map(item => ({
    priority: reportService.getPriorityLabel(item.priority),
    count: item.count,
    color: reportService.getPriorityColor(item.priority)
  })) || []

  // Dados para gráfico de barras - Top Clientes
  const topClientsData = processAnalytics?.by_client
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      client: item.client,
      count: item.count
    })) || []

  // Dados para gráfico de barras - Tarefas por Categoria
  const taskCategoryData = taskAnalytics?.by_category.map(item => ({
    category: item.category || 'Sem Categoria',
    count: item.count
  })) || []

  // Métricas principais
  const mainMetrics = {
    totalProcesses: stats?.processes.total || 0,
    activeProcesses: stats?.processes.active || 0,
    totalTasks: stats?.tasks.total || 0,
    completedTasks: stats?.tasks.completed || 0,
    pendingTasks: stats?.tasks.pending || 0,
    totalFiles: stats?.files.total || 0,
    recentTasks: stats?.recent.tasks_30_days || 0,
    recentProcesses: stats?.recent.processes_30_days || 0
  }

  // Cálculos de porcentagem
  const completionRate = reportService.calculateCompletionRate(
    mainMetrics.completedTasks,
    mainMetrics.totalTasks
  )

  const processCompletionRate = reportService.calculateCompletionRate(
    mainMetrics.activeProcesses,
    mainMetrics.totalProcesses
  )

  return {
    isLoading,
    mainMetrics,
    completionRate,
    processCompletionRate,
    processStatusChartData,
    taskStatusChartData,
    monthlyProcessesData,
    taskPriorityData,
    topClientsData,
    taskCategoryData,
    avgCompletionTime: reportService.formatDuration(taskAnalytics?.avg_completion_time_seconds || 0)
  }
}

export default useReports
