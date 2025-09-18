import React, { useState } from 'react'
import { Calendar, Badge, Card, List, Tag, Typography, Space, Button, Modal, Select } from 'antd'
import { 
  CalendarOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  FileTextOutlined, CheckSquareOutlined, SendOutlined, DollarOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

const { Title, Text } = Typography
const { Option } = Select

interface CalendarEvent {
  id: string
  title: string
  type: 'process' | 'task' | 'delivery' | 'payment'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  date: string
  time?: string
  assignee?: string
  processNumber?: string
  description?: string
}

export const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([])

  // Dados mockados de eventos
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Vencimento - Processo 1001234-56.2024.8.26.0001',
      type: 'process',
      priority: 'high',
      status: 'overdue',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      assignee: 'Carlos Lima',
      processNumber: '1001234-56.2024.8.26.0001',
      description: 'Ação Trabalhista - Rescisão Indireta'
    },
    {
      id: '2',
      title: 'Tarefa - Cálculo de Rescisão',
      type: 'task',
      priority: 'high',
      status: 'in_progress',
      date: dayjs().format('YYYY-MM-DD'),
      time: '14:00',
      assignee: 'Ana Santos',
      description: 'Finalizar cálculo de rescisão trabalhista'
    },
    {
      id: '3',
      title: 'Entrega - Parecer Técnico',
      type: 'delivery',
      priority: 'medium',
      status: 'pending',
      date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      time: '10:00',
      assignee: 'Maria Costa',
      description: 'Entrega do parecer técnico para análise'
    },
    {
      id: '4',
      title: 'Pagamento - Carlos Lima',
      type: 'payment',
      priority: 'medium',
      status: 'pending',
      date: dayjs().add(2, 'days').format('YYYY-MM-DD'),
      assignee: 'Sistema',
      description: 'Pagamento de R$ 2.500,00 por cálculo concluído'
    },
    {
      id: '5',
      title: 'Vencimento - Processo 2001234-56.2024.8.26.0002',
      type: 'process',
      priority: 'high',
      status: 'pending',
      date: dayjs().add(3, 'days').format('YYYY-MM-DD'),
      assignee: 'Ana Santos',
      processNumber: '2001234-56.2024.8.26.0002',
      description: 'Ação de Cobrança - Contrato'
    },
    {
      id: '6',
      title: 'Tarefa - Análise de Documentos',
      type: 'task',
      priority: 'low',
      status: 'completed',
      date: dayjs().add(5, 'days').format('YYYY-MM-DD'),
      assignee: 'Roberto Silva',
      description: 'Análise completa dos documentos do processo'
    }
  ]

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'process': return '#1890ff'
      case 'task': return '#52c41a'
      case 'delivery': return '#722ed1'
      case 'payment': return '#faad14'
      default: return '#666'
    }
  }

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'process': return <FileTextOutlined />
      case 'task': return <CheckSquareOutlined />
      case 'delivery': return <SendOutlined />
      case 'payment': return <DollarOutlined />
      default: return <CalendarOutlined />
    }
  }

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'processing'
      case 'pending': return 'warning'
      case 'overdue': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />
      case 'in_progress': return <ClockCircleOutlined />
      case 'pending': return <ClockCircleOutlined />
      case 'overdue': return <ExclamationCircleOutlined />
      default: return <ClockCircleOutlined />
    }
  }

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    return events.filter(event => event.date === dateStr)
  }

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value)
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map(item => (
          <li key={item.id}>
            <Badge
              color={getEventTypeColor(item.type)}
              text={
                <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </div>
              }
            />
          </li>
        ))}
      </ul>
    )
  }

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value)
    const dayEvents = getListData(value)
    setSelectedEvents(dayEvents)
    if (dayEvents.length > 0) {
      setIsModalVisible(true)
    }
  }

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'process': return 'Processo'
      case 'task': return 'Tarefa'
      case 'delivery': return 'Entrega'
      case 'payment': return 'Pagamento'
      default: return 'Evento'
    }
  }

  const getStatusLabel = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'in_progress': return 'Em Andamento'
      case 'pending': return 'Pendente'
      case 'overdue': return 'Vencido'
      default: return 'Desconhecido'
    }
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
            Calendário de Prazos
          </Title>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Visualize todos os prazos e eventos do sistema
          </Text>
        </div>
        <Space>
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 120 }}
          >
            <Option value="calendar">Calendário</Option>
            <Option value="list">Lista</Option>
          </Select>
        </Space>
      </div>

      {viewMode === 'calendar' ? (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: 'none'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Calendar
            dateCellRender={dateCellRender}
            onSelect={onSelect}
            style={{ borderRadius: '12px' }}
            headerRender={({ value, type, onChange, onTypeChange }) => (
              <div style={{ padding: '8px 0', marginBottom: '16px' }}>
                <Title level={3} style={{ textAlign: 'center', margin: 0, color: '#031f5f' }}>
                  {value.format('MMMM [de] YYYY')}
                </Title>
              </div>
            )}
          />
        </Card>
      ) : (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: 'none'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <List
            dataSource={events.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))}
            renderItem={(event) => (
              <List.Item
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => {
                  setSelectedEvents([event])
                  setIsModalVisible(true)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: getEventTypeColor(event.type),
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px'
                      }}
                    >
                      {getEventTypeIcon(event.type)}
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        {event.title}
                      </Text>
                      <Tag color={getEventTypeColor(event.type)} size="small">
                        {getEventTypeLabel(event.type)}
                      </Tag>
                      <Tag color={getPriorityColor(event.priority)} size="small">
                        {event.priority === 'high' ? 'Alta' : event.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Tag>
                      <Tag color={getStatusColor(event.status)} size="small" icon={getStatusIcon(event.status)}>
                        {getStatusLabel(event.status)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                        {event.description}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Text style={{ fontSize: '12px', color: '#999' }}>
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          {dayjs(event.date).format('DD/MM/YYYY')}
                          {event.time && ` às ${event.time}`}
                        </Text>
                        {event.assignee && (
                          <Text style={{ fontSize: '12px', color: '#999' }}>
                            Responsável: {event.assignee}
                          </Text>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Modal de Detalhes do Evento */}
      <Modal
        title="Detalhes do Evento"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Fechar
          </Button>
        ]}
        width={600}
      >
        {selectedEvents.map(event => (
          <Card key={event.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: getEventTypeColor(event.type),
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}
              >
                {getEventTypeIcon(event.type)}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {event.title}
                </Title>
                <Space>
                  <Tag color={getEventTypeColor(event.type)}>
                    {getEventTypeLabel(event.type)}
                  </Tag>
                  <Tag color={getPriorityColor(event.priority)}>
                    {event.priority === 'high' ? 'Alta' : event.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                  </Tag>
                  <Tag color={getStatusColor(event.status)} icon={getStatusIcon(event.status)}>
                    {getStatusLabel(event.status)}
                  </Tag>
                </Space>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                {event.description}
              </Text>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Text strong>Data:</Text>
                <div>
                  <Text style={{ color: '#666' }}>
                    {dayjs(event.date).format('DD/MM/YYYY')}
                    {event.time && ` às ${event.time}`}
                  </Text>
                </div>
              </div>
              
              {event.assignee && (
                <div>
                  <Text strong>Responsável:</Text>
                  <div>
                    <Text style={{ color: '#666' }}>{event.assignee}</Text>
                  </div>
                </div>
              )}
              
              {event.processNumber && (
                <div>
                  <Text strong>Número do Processo:</Text>
                  <div>
                    <Text style={{ color: '#666' }}>{event.processNumber}</Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </Modal>
    </div>
  )
}
