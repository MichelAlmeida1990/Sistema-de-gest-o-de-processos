// import { debugLogger } from '../utils/debug'

export interface WebSocketMessage {
  type: string
  data?: any
  timestamp: string
  message?: string
  message_type?: string
  notification_id?: number
}

export interface NotificationData {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private userId: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private isConnecting = false
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()

  connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Já está conectando'))
        return
      }

      this.isConnecting = true
      this.userId = userId

      try {
        const wsUrl = `ws://localhost:8000/api/v1/ws/ws/${userId}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket conectado para usuário:', userId)
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket desconectado:', { 
            code: event.code, 
            reason: event.reason 
          })
          this.isConnecting = false
          this.stopHeartbeat()
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('Erro no WebSocket:', error)
          this.isConnecting = false
          reject(error)
        }

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
    this.userId = null
  }

  private reconnect(): void {
    if (!this.userId) return

    this.reconnectAttempts++
    console.log('Tentativa de reconexão WebSocket:', this.reconnectAttempts)

    setTimeout(() => {
      this.connect(this.userId!)
        .catch(() => {
          // Falha na reconexão será tratada pelo onclose
        })
    }, this.reconnectInterval * this.reconnectAttempts)
  }

  private startHeartbeat(): void {
    // Enviar ping a cada 30 segundos
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000)
  }

  private stopHeartbeat(): void {
    // Limpar intervalos se necessário
  }

  private handleMessage(message: WebSocketMessage): void {
    debugLogger.log('WEBSOCKET', 'MESSAGE_RECEIVED', message)

    // Chamar handlers específicos para o tipo de mensagem
    const handlers = this.messageHandlers.get(message.type) || []
    handlers.forEach(handler => {
      try {
        handler(message.data || message)
      } catch (error) {
        console.error(`Erro no handler para ${message.type}:`, error)
      }
    })

    // Handlers específicos para tipos conhecidos
    switch (message.type) {
      case 'notification':
        this.handleNotification(message.data)
        break
      case 'task_update':
        this.handleTaskUpdate(message.data)
        break
      case 'process_update':
        this.handleProcessUpdate(message.data)
        break
      case 'system_message':
        this.handleSystemMessage(message)
        break
      case 'pong':
        debugLogger.log('WEBSOCKET', 'PONG_RECEIVED')
        break
    }
  }

  private handleNotification(data: NotificationData): void {
    // Disparar evento customizado para notificações
    const event = new CustomEvent('websocket-notification', { detail: data })
    window.dispatchEvent(event)
  }

  private handleTaskUpdate(data: any): void {
    // Disparar evento customizado para atualizações de tarefas
    const event = new CustomEvent('websocket-task-update', { detail: data })
    window.dispatchEvent(event)
  }

  private handleProcessUpdate(data: any): void {
    // Disparar evento customizado para atualizações de processos
    const event = new CustomEvent('websocket-process-update', { detail: data })
    window.dispatchEvent(event)
  }

  private handleSystemMessage(message: WebSocketMessage): void {
    // Disparar evento customizado para mensagens do sistema
    const event = new CustomEvent('websocket-system-message', { 
      detail: {
        message: message.message,
        type: message.message_type
      }
    })
    window.dispatchEvent(event)
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket não está conectado')
    }
  }

  // Métodos para registrar handlers de mensagens
  on(messageType: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, [])
    }
    this.messageHandlers.get(messageType)!.push(handler)
  }

  off(messageType: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(messageType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Métodos específicos para diferentes tipos de mensagens
  markNotificationAsRead(notificationId: number): void {
    this.send({
      type: 'notification_read',
      notification_id: notificationId
    })
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED
  }
}

export const websocketService = new WebSocketService()
