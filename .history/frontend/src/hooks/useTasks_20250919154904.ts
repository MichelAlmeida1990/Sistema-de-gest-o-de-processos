// ===========================================
// HOOK DE TAREFAS
// ===========================================

import { useState, useEffect } from 'react'
import { message } from 'antd'
import taskService, { Task, TaskCreate, TaskUpdate, TaskFilters } from '../services/tasks'

// ===========================================
// HOOK DE LISTA DE TAREFAS
// ===========================================

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await taskService.getTasks(filters)
      setTasks(response.tasks)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filters.page, filters.per_page, filters.search, filters.status, filters.priority, filters.category, filters.assigned_user_id, filters.process_id])

  return {
    tasks,
    total,
    isLoading,
    error,
    refetch: fetchTasks
  }
}

// ===========================================
// HOOK DE MINHAS TAREFAS
// ===========================================

export function useMyTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await taskService.getMyTasks(filters)
      setTasks(response.tasks)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyTasks()
  }, [filters.page, filters.per_page])

  return {
    tasks,
    total,
    isLoading,
    error,
    refetch: fetchMyTasks
  }
}

// ===========================================
// HOOK DE TAREFA INDIVIDUAL
// ===========================================

export function useTask(id: number | null) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTask = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await taskService.getTask(id)
      setTask(response)
    } catch (err: any) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTask()
  }, [id])

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask
  }
}

// ===========================================
// HOOK DE CRIAÇÃO DE TAREFA
// ===========================================

export function useCreateTask() {
  const [isLoading, setIsLoading] = useState(false)

  const createTask = async (taskData: TaskCreate) => {
    try {
      setIsLoading(true)
      const response = await taskService.createTask(taskData)
      message.success('Tarefa criada com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createTask,
    isLoading
  }
}

// ===========================================
// HOOK DE ATUALIZAÇÃO DE TAREFA
// ===========================================

export function useUpdateTask() {
  const [isLoading, setIsLoading] = useState(false)

  const updateTask = async (id: number, taskData: TaskUpdate) => {
    try {
      setIsLoading(true)
      const response = await taskService.updateTask(id, taskData)
      message.success('Tarefa atualizada com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateTask,
    isLoading
  }
}

// ===========================================
// HOOK DE DELEÇÃO DE TAREFA
// ===========================================

export function useDeleteTask() {
  const [isLoading, setIsLoading] = useState(false)

  const deleteTask = async (id: number) => {
    try {
      setIsLoading(true)
      await taskService.deleteTask(id)
      message.success('Tarefa deletada com sucesso!')
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deleteTask,
    isLoading
  }
}

// ===========================================
// HOOK DE AÇÕES ESPECÍFICAS
// ===========================================

export function useTaskActions() {
  const [isLoading, setIsLoading] = useState(false)

  const completeTask = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await taskService.completeTask(id)
      message.success('Tarefa concluída com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = async (id: number, percentage: number) => {
    try {
      setIsLoading(true)
      const response = await taskService.updateProgress(id, percentage)
      message.success('Progresso atualizado com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const assignTask = async (id: number, userId: number) => {
    try {
      setIsLoading(true)
      const response = await taskService.assignTask(id, userId)
      message.success('Tarefa atribuída com sucesso!')
      return response
    } catch (error: any) {
      message.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    completeTask,
    updateProgress,
    assignTask,
    isLoading
  }
}

export default useTasks






