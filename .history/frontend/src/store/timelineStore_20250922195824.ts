import { create } from 'zustand'
import dayjs from 'dayjs'

export interface TimelineEvent {
  id: string
  type: 'process' | 'task' | 'delivery' | 'comment' | 'system' | 'financial'
  title: string
  description: string
  user: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  processNumber?: string
  attachments?: string[]
  metadata?: Record<string, any>
}

interface TimelineStore {
  events: TimelineEvent[]
  addEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void
  getEventsByProcess: (processNumber: string) => TimelineEvent[]
  getEventsByType: (type: string) => TimelineEvent[]
  clearEvents: () => void
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  events: [
    // Eventos iniciais mockados
    {
      id: '1',
      type: 'process',
      title: 'Processo Criado',
      description: 'Novo processo trabalhista cadastrado no sistema',
      user: 'Ana Santos',
      timestamp: '2024-01-15T08:00:00',
      status: 'success',
      processNumber: '1001234-56.2024.8.26.0001',
      metadata: {
        client: 'João Silva',
        court: 'TRT 1ª Região'
      }
    },
    {
      id: '2',
      type: 'task',
      title: 'Tarefa de Cálculo Criada',
      description: 'Cálculo de rescisão trabalhista - análise de documentos',
      user: 'Carlos Lima',
      timestamp: '2024-01-15T10:30:00',
      status: 'info',
      processNumber: '1001234-56.2024.8.26.0001',
      metadata: {
        taskType: 'Cálculo Trabalhista',
        priority: 'Alta'
      }
    },
    {
      id: '3',
      type: 'comment',
      title: 'Comentário Adicionado',
      description: 'Documentos insuficientes. Solicitar certidão de tempo de contribuição.',
      user: 'Maria Costa',
      timestamp: '2024-01-16T14:20:00',
      status: 'warning',
      processNumber: '1001234-56.2024.8.26.0001',
      attachments: ['documento.pdf']
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Entrega de Cálculo',
      description: 'PDF com cálculos de rescisão enviado para o cliente',
      user: 'Roberto Silva',
      timestamp: '2024-01-18T16:45:00',
      status: 'success',
      processNumber: '1001234-56.2024.8.26.0001',
      attachments: ['calculo_rescisao.pdf'],
      metadata: {
        deliveryType: 'PDF',
        recipient: 'João Silva'
      }
    }
  ],

  addEvent: (eventData) => {
    const newEvent: TimelineEvent = {
      ...eventData,
      id: Date.now().toString(),
      timestamp: dayjs().format('YYYY-MM-DDTHH:mm:ss')
    }
    
    set((state) => ({
      events: [newEvent, ...state.events].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }))
  },

  getEventsByProcess: (processNumber) => {
    return get().events.filter(event => event.processNumber === processNumber)
  },

  getEventsByType: (type) => {
    return get().events.filter(event => event.type === type)
  },

  clearEvents: () => {
    set({ events: [] })
  }
}))

// Funções utilitárias para criar eventos automaticamente
export const createProcessEvent = (
  action: 'created' | 'updated' | 'status_changed',
  processNumber: string,
  user: string,
  metadata?: Record<string, any>
) => {
  const eventMap = {
    created: {
      title: 'Processo Criado',
      description: `Novo processo ${processNumber} cadastrado no sistema`,
      status: 'success' as const
    },
    updated: {
      title: 'Processo Atualizado',
      description: `Dados do processo ${processNumber} foram modificados`,
      status: 'info' as const
    },
    status_changed: {
      title: 'Status do Processo Alterado',
      description: `Status do processo ${processNumber} foi alterado para "${metadata?.newStatus || 'Novo Status'}"`,
      status: 'info' as const
    }
  }

  const eventData = eventMap[action]
  
  useTimelineStore.getState().addEvent({
    type: 'process',
    title: eventData.title,
    description: eventData.description,
    user,
    status: eventData.status,
    processNumber,
    metadata
  })
}

export const createTaskEvent = (
  action: 'created' | 'assigned' | 'status_changed' | 'completed',
  processNumber: string,
  user: string,
  metadata?: Record<string, any>
) => {
  const eventMap = {
    created: {
      title: 'Tarefa Criada',
      description: `Nova tarefa "${metadata?.taskTitle || 'Sem título'}" criada`,
      status: 'info' as const
    },
    assigned: {
      title: 'Tarefa Atribuída',
      description: `Tarefa atribuída para ${metadata?.assignee || 'usuário'}`,
      status: 'info' as const
    },
    status_changed: {
      title: 'Status da Tarefa Alterado',
      description: `Tarefa alterada para "${metadata?.newStatus || 'Novo Status'}"`,
      status: 'info' as const
    },
    completed: {
      title: 'Tarefa Concluída',
      description: `Tarefa "${metadata?.taskTitle || 'Sem título'}" foi concluída`,
      status: 'success' as const
    }
  }

  const eventData = eventMap[action]
  
  useTimelineStore.getState().addEvent({
    type: 'task',
    title: eventData.title,
    description: eventData.description,
    user,
    status: eventData.status,
    processNumber,
    metadata
  })
}

export const createDeliveryEvent = (
  action: 'uploaded' | 'sent' | 'received',
  processNumber: string,
  user: string,
  metadata?: Record<string, any>
) => {
  const eventMap = {
    uploaded: {
      title: 'Arquivo Enviado',
      description: `Arquivo "${metadata?.fileName || 'documento'}" foi enviado`,
      status: 'success' as const
    },
    sent: {
      title: 'Entrega Realizada',
      description: `Entrega de ${metadata?.deliveryType || 'documento'} enviada para ${metadata?.recipient || 'cliente'}`,
      status: 'success' as const
    },
    received: {
      title: 'Arquivo Recebido',
      description: `Arquivo "${metadata?.fileName || 'documento'}" foi recebido`,
      status: 'info' as const
    }
  }

  const eventData = eventMap[action]
  
  useTimelineStore.getState().addEvent({
    type: 'delivery',
    title: eventData.title,
    description: eventData.description,
    user,
    status: eventData.status,
    processNumber,
    attachments: metadata?.attachments || [],
    metadata
  })
}

export const createFinancialEvent = (
  action: 'payment_registered' | 'payment_updated' | 'value_changed',
  processNumber: string,
  user: string,
  metadata?: Record<string, any>
) => {
  const eventMap = {
    payment_registered: {
      title: 'Pagamento Registrado',
      description: `Pagamento de R$ ${metadata?.amount || '0,00'} registrado para ${metadata?.partner || 'parceiro'}`,
      status: 'success' as const
    },
    payment_updated: {
      title: 'Pagamento Atualizado',
      description: `Status do pagamento alterado para "${metadata?.newStatus || 'Novo Status'}"`,
      status: 'info' as const
    },
    value_changed: {
      title: 'Valor Alterado',
      description: `Valor alterado de R$ ${metadata?.oldValue || '0,00'} para R$ ${metadata?.newValue || '0,00'}`,
      status: 'warning' as const
    }
  }

  const eventData = eventMap[action]
  
  useTimelineStore.getState().addEvent({
    type: 'financial',
    title: eventData.title,
    description: eventData.description,
    user,
    status: eventData.status,
    processNumber,
    metadata
  })
}










