// ===========================================
// HOOK DE PROCESSOS
// ===========================================

import { useState, useEffect } from 'react'
import { message } from 'antd'
import processService, { Process, ProcessCreate, ProcessUpdate, ProcessFilters } from '../services/processes'

// ===========================================
// HOOK DE LISTA DE PROCESSOS
// ===========================================

export function useProcesses(filters: ProcessFilters = {}) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProcesses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await processService.getProcesses(filters)
      setProcesses(response.processes)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProcesses()
  }, [filters.page, filters.per_page, filters.search, filters.status, filters.priority, filters.category])

  return {
    processes,
    total,
    isLoading,
    error,
    refetch: fetchProcesses
  }
}

// ===========================================
// HOOK DE MEUS PROCESSOS
// ===========================================

export function useMyProcesses(filters: ProcessFilters = {}) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyProcesses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await processService.getMyProcesses(filters)
      setProcesses(response.processes)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProcesses()
  }, [filters.page, filters.per_page])

  return {
    processes,
    total,
    isLoading,
    error,
    refetch: fetchMyProcesses
  }
}

// ===========================================
// HOOK DE PROCESSO INDIVIDUAL
// ===========================================

export function useProcess(id: number | null) {
  const [process, setProcess] = useState<Process | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProcess = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await processService.getProcess(id)
      setProcess(response)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProcess()
  }, [id])

  return {
    process,
    isLoading,
    error,
    refetch: fetchProcess
  }
}

// ===========================================
// HOOK DE CRIAÇÃO DE PROCESSO
// ===========================================

export function useCreateProcess() {
  const [isLoading, setIsLoading] = useState(false)

  const createProcess = async (processData: ProcessCreate) => {
    try {
      setIsLoading(true)
      const response = await processService.createProcess(processData)
      message.success('Processo criado com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createProcess,
    isLoading
  }
}

// ===========================================
// HOOK DE ATUALIZAÇÃO DE PROCESSO
// ===========================================

export function useUpdateProcess() {
  const [isLoading, setIsLoading] = useState(false)

  const updateProcess = async (id: number, processData: ProcessUpdate) => {
    try {
      setIsLoading(true)
      const response = await processService.updateProcess(id, processData)
      message.success('Processo atualizado com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateProcess,
    isLoading
  }
}

// ===========================================
// HOOK DE DELEÇÃO DE PROCESSO
// ===========================================

export function useDeleteProcess() {
  const [isLoading, setIsLoading] = useState(false)

  const deleteProcess = async (id: number) => {
    try {
      setIsLoading(true)
      await processService.deleteProcess(id)
      message.success('Processo deletado com sucesso!')
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deleteProcess,
    isLoading
  }
}

export default useProcesses








