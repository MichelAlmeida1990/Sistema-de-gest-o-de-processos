import React, { useState } from 'react'
import { 
  Row, Col, Card, Button, Input, Select, Typography, Modal, Form, message, 
  Tag, Avatar, Space, Timeline, Badge, Divider, Tooltip, DatePicker
} from 'antd'
import {
  PlusOutlined, SearchOutlined, FilterOutlined, EditOutlined, 
  UserOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
  MessageOutlined, PaperClipOutlined, EyeOutlined, DownloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTimelineStore, TimelineEvent } from '../store/timelineStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

// Interface TimelineEvent agora vem do store

interface Process {
  id: string
  number: string
  title: string
  status: string
  client: string
  lastActivity: string
}

export const TimelinePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<string>('all')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [form] = Form.useForm()
  
  // Usar o store centralizado
  const { events, addEvent } = useTimelineStore()

  // Dados mockados dos processos
  const processes: Process[] = [
    {
      id: '1',
      number: '1001234-56.2024.8.26.0001',
      title: 'Ação Trabalhista - Rescisão',
      status: 'Em Andamento',
      client: 'João Silva',
      lastActivity: '2024-01-20T10:30:00'
    },
    {
      id: '2',
      number: '2001234-56.2024.8.26.0002',
      title: 'Processo Criminal - Furto',
      status: 'Concluído',
      client: 'Maria Santos',
      lastActivity: '2024-01-18T15:45:00'
    },
    {
      id: '3',
      number: '3001234-56.2024.8.26.0003',
      title: 'Ação Civil - Danos Morais',
      status: 'Aguardando',
      client: 'Carlos Lima',
      lastActivity: '2024-01-15T09:20:00'
    }
  ]

  // Estado para os eventos da timeline
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
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
    },
    {
      id: '5',
      type: 'system',
      title: 'Processo Atualizado',
      description: 'Status alterado para "Em Andamento"',
      user: 'Sistema',
      timestamp: '2024-01-20T10:30:00',
      status: 'info',
      processNumber: '1001234-56.2024.8.26.0001'
    }
  ])

  const getEventIcon = (type: string, status: string) => {
    const iconProps = { style: { fontSize: '16px' } }
    
    switch (type) {
      case 'process':
        return <FileTextOutlined {...iconProps} />
      case 'task':
        return <CheckCircleOutlined {...iconProps} />
      case 'delivery':
        return <DownloadOutlined {...iconProps} />
      case 'comment':
        return <MessageOutlined {...iconProps} />
      case 'system':
        return <InfoCircleOutlined {...iconProps} />
      default:
        return <ClockCircleOutlined {...iconProps} />
    }
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case 'success': return '#52c41a'
      case 'warning': return '#faad14'
      case 'error': return '#ff4d4f'
      case 'info': return '#1890ff'
      default: return '#d9d9d9'
    }
  }

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'process': return 'Processo'
      case 'task': return 'Tarefa'
      case 'delivery': return 'Entrega'
      case 'comment': return 'Comentário'
      case 'system': return 'Sistema'
      default: return type
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'process': return 'blue'
      case 'task': return 'green'
      case 'delivery': return 'purple'
      case 'comment': return 'orange'
      case 'system': return 'default'
      default: return 'default'
    }
  }

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchText.toLowerCase()) ||
                         (event.processNumber && event.processNumber.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchesProcess = selectedProcess === 'all' || event.processNumber === selectedProcess
    const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter
    
    return matchesSearch && matchesProcess && matchesType
  })

  const handleCreateEvent = () => {
    setEditingEvent(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event)
    form.setFieldsValue({
      ...event,
      timestamp: dayjs(event.timestamp)
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingEvent) {
        // Atualizar evento existente
        setTimelineEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === editingEvent.id 
              ? {
                  ...event,
                  ...values,
                  timestamp: values.timestamp ? values.timestamp.format('YYYY-MM-DDTHH:mm:ss') : event.timestamp,
                  id: event.id
                }
              : event
          )
        )
        message.success('Evento atualizado com sucesso!')
      } else {
        // Criar novo evento
        const newEvent: TimelineEvent = {
          id: Date.now().toString(),
          ...values,
          timestamp: values.timestamp ? values.timestamp.format('YYYY-MM-DDTHH:mm:ss') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          attachments: values.attachments || []
        }
        
        setTimelineEvents(prevEvents => {
          const newEvents = [...prevEvents, newEvent].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          console.log('Novo evento adicionado:', newEvent)
          console.log('Total de eventos:', newEvents.length)
          return newEvents
        })
        message.success('Evento criado com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      setEditingEvent(null)
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      message.error('Erro ao salvar evento')
    } finally {
      setLoading(false)
    }
  }

  const EventCard = ({ event }: { event: TimelineEvent }) => {
    return (
      <Card
        size="small"
        style={{
          marginBottom: '12px',
          borderRadius: '12px',
          border: '1px solid #e8e8e8',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        hoverable
        onClick={() => handleEditEvent(event)}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: getEventColor(event.status),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}
          >
            {getEventIcon(event.type, event.status)}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {event.title}
              </Text>
              <Tag color={getEventTypeColor(event.type)} size="small">
                {getEventTypeText(event.type)}
              </Tag>
              <Tag color={event.status === 'success' ? 'green' : event.status === 'warning' ? 'orange' : event.status === 'error' ? 'red' : 'blue'} size="small">
                {event.status === 'success' ? 'Sucesso' : event.status === 'warning' ? 'Atenção' : event.status === 'error' ? 'Erro' : 'Info'}
              </Tag>
            </div>
            
            <Text style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px' }}>
              {event.processNumber}
            </Text>
            
            <Paragraph style={{ fontSize: '13px', marginBottom: '8px', margin: 0 }}>
              {event.description}
            </Paragraph>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size={20} icon={<UserOutlined />} />
                <Text style={{ fontSize: '12px', color: '#666' }}>{event.user}</Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClockCircleOutlined style={{ fontSize: '12px', color: '#666' }} />
                <Text style={{ fontSize: '11px', color: '#666' }}>
                  {dayjs(event.timestamp).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </div>
            
            {event.attachments && event.attachments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '11px', color: '#666', marginRight: '8px' }}>Anexos:</Text>
                {event.attachments.map((attachment, index) => (
                  <Tag key={index} size="small" style={{ margin: '1px' }}>
                    <PaperClipOutlined style={{ marginRight: '4px' }} />
                    {attachment}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Timeline de Atividades
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Histórico completo de eventos e atividades dos processos
        </Text>
      </div>

      {/* Filters and Actions */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none',
          marginBottom: '24px'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Buscar eventos..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: '12px' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Processo"
              value={selectedProcess}
              onChange={setSelectedProcess}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              {processes.map(process => (
                <Option key={process.id} value={process.number}>
                  {process.number}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Tipo de Evento"
              value={eventTypeFilter}
              onChange={setEventTypeFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              <Option value="process">Processo</Option>
              <Option value="task">Tarefa</Option>
              <Option value="delivery">Entrega</Option>
              <Option value="comment">Comentário</Option>
              <Option value="system">Sistema</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateEvent}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                  border: 'none'
                }}
              >
                Novo Evento
              </Button>
              <Button
                icon={<FilterOutlined />}
                style={{ borderRadius: '12px' }}
              >
                Filtros
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Timeline */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Histórico de Atividades</span>
                <Badge count={filteredEvents.length} style={{ backgroundColor: '#031f5f' }} />
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Timeline
              mode="left"
              style={{ marginTop: '20px' }}
            >
              {filteredEvents.map((event, index) => (
                <Timeline.Item
                  key={event.id}
                  color={getEventColor(event.status)}
                  dot={getEventIcon(event.type, event.status)}
                >
                  <EventCard event={event} />
                </Timeline.Item>
              ))}
            </Timeline>
            
            {filteredEvents.length === 0 && (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: '#999',
                  textAlign: 'center'
                }}
              >
                <ClockCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Text style={{ fontSize: '16px', color: '#999' }}>
                  Nenhum evento encontrado
                </Text>
                <Text style={{ fontSize: '14px', color: '#ccc' }}>
                  Tente ajustar os filtros ou criar um novo evento
                </Text>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={6}>
          <Card
            title="Processos Ativos"
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {processes.map(process => (
                <Card
                  key={process.id}
                  size="small"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  hoverable
                  onClick={() => setSelectedProcess(process.number)}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ fontSize: '12px', display: 'block' }}>
                      {process.number}
                    </Text>
                    <Text style={{ fontSize: '11px', color: '#666' }}>
                      {process.title}
                    </Text>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Tag 
                      color={process.status === 'Concluído' ? 'green' : process.status === 'Em Andamento' ? 'blue' : 'orange'}
                      size="small"
                    >
                      {process.status}
                    </Tag>
                    <Text style={{ fontSize: '10px', color: '#999' }}>
                      {dayjs(process.lastActivity).format('DD/MM')}
                    </Text>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modal para criar/editar evento */}
      <Modal
        title={editingEvent ? 'Editar Evento' : 'Novo Evento'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Título do Evento"
            name="title"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: Processo Criado" />
          </Form.Item>
          
          <Form.Item
            label="Descrição"
            name="description"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={3} placeholder="Descreva o evento..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Processo Relacionado"
                name="processNumber"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o processo">
                  {processes.map(process => (
                    <Option key={process.id} value={process.number}>
                      {process.number}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Usuário Responsável"
                name="user"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Ex: Ana Santos" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tipo de Evento"
                name="type"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Tipo">
                  <Option value="process">Processo</Option>
                  <Option value="task">Tarefa</Option>
                  <Option value="delivery">Entrega</Option>
                  <Option value="comment">Comentário</Option>
                  <Option value="system">Sistema</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Status">
                  <Option value="success">Sucesso</Option>
                  <Option value="warning">Atenção</Option>
                  <Option value="error">Erro</Option>
                  <Option value="info">Info</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Data e Hora"
                name="timestamp"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Anexos"
            name="attachments"
          >
            <Select mode="tags" placeholder="Adicione nomes de arquivos">
              <Option value="documento.pdf">documento.pdf</Option>
              <Option value="calculo.pdf">calculo.pdf</Option>
              <Option value="parecer.pdf">parecer.pdf</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
