import React, { useState } from 'react'
import { 
  Row, Col, Card, Button, Input, Select, Typography, Modal, Form, message, 
  Tag, Avatar, Tooltip, Badge, Space, Dropdown, DatePicker
} from 'antd'
import {
  PlusOutlined, SearchOutlined, FilterOutlined, EditOutlined, 
  UserOutlined, CalendarOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  MoreOutlined, EyeOutlined, CheckCircleOutlined, FileTextOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { createTaskEvent } from '../store/timelineStore'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography
const { Option } = Select

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  processNumber: string
  dueDate: string
  tags: string[]
  progress: number
}

interface KanbanColumn {
  id: string
  title: string
  status: Task['status']
  color: string
  tasks: Task[]
}

export const KanbanPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form] = Form.useForm()

  // Estado para as tarefas
  const [tasksData, setTasksData] = useState<Task[]>([
    {
      id: '1',
      title: 'Cálculo de Rescisão Trabalhista',
      description: 'Calcular valores de rescisão incluindo salários, férias, 13º e FGTS',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Carlos Lima',
      processNumber: '1001234-56.2024.8.26.0001',
      dueDate: '2024-01-25',
      tags: ['Urgente', 'Trabalhista'],
      progress: 75
    },
    {
      id: '2',
      title: 'Análise de Documentos',
      description: 'Analisar documentos enviados pelo cliente',
      status: 'todo',
      priority: 'medium',
      assignee: 'Ana Santos',
      processNumber: '2001234-56.2024.8.26.0002',
      dueDate: '2024-01-30',
      tags: ['Documentação'],
      progress: 0
    },
    {
      id: '3',
      title: 'Elaboração de Parecer',
      description: 'Elaborar parecer técnico sobre a viabilidade da ação',
      status: 'review',
      priority: 'low',
      assignee: 'Maria Costa',
      processNumber: '3001234-56.2024.8.26.0003',
      dueDate: '2024-02-20',
      tags: ['Parecer'],
      progress: 90
    },
    {
      id: '4',
      title: 'Coleta de Provas',
      description: 'Coletar e organizar provas documentais',
      status: 'done',
      priority: 'high',
      assignee: 'Roberto Silva',
      processNumber: '4001234-56.2024.8.26.0004',
      dueDate: '2024-01-15',
      tags: ['Criminal', 'Provas'],
      progress: 100
    }
  ])

  const columns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'A Fazer',
      status: 'todo',
      color: '#faad14',
      tasks: tasksData.filter(task => task.status === 'todo')
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      status: 'in_progress',
      color: '#1890ff',
      tasks: tasksData.filter(task => task.status === 'in_progress')
    },
    {
      id: 'review',
      title: 'Em Revisão',
      status: 'review',
      color: '#722ed1',
      tasks: tasksData.filter(task => task.status === 'review')
    },
    {
      id: 'done',
      title: 'Concluído',
      status: 'done',
      color: '#52c41a',
      tasks: tasksData.filter(task => task.status === 'done')
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return priority
    }
  }

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           task.processNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchText.toLowerCase())
      
      const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      
      return matchesSearch && matchesAssignee && matchesPriority
    })
  }))

  const handleCreateTask = () => {
    setEditingTask(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    form.setFieldsValue({
      ...task,
      dueDate: dayjs(task.dueDate)
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingTask) {
        // Atualizar tarefa existente
        setTasksData(prevTasks => 
          prevTasks.map(task => 
            task.id === editingTask.id 
              ? {
                  ...task,
                  ...values,
                  dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : task.dueDate,
                  id: task.id
                }
              : task
          )
        )
        message.success('Tarefa atualizada com sucesso!')
      } else {
        // Criar nova tarefa
        const progressValue = values.status === 'done' ? 100 : 
                             values.status === 'review' ? 90 : 
                             values.status === 'in_progress' ? 50 : 0
        
        const newTask: Task = {
          id: Date.now().toString(),
          ...values,
          dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
          progress: progressValue
        }
        
        setTasksData(prevTasks => {
          const newTasks = [...prevTasks, newTask]
          console.log('Nova tarefa adicionada:', newTask)
          console.log('Total de tarefas:', newTasks.length)
          return newTasks
        })
        message.success('Tarefa criada com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      setEditingTask(null)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      message.error('Erro ao salvar tarefa')
    } finally {
      setLoading(false)
    }
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = dayjs(task.dueDate).isBefore(dayjs())
    
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
        onClick={() => handleEditTask(task)}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text strong style={{ fontSize: '14px', lineHeight: 1.4, flex: 1 }}>
              {task.title}
            </Text>
            <Tag 
              color={getPriorityColor(task.priority)} 
              size="small"
              style={{ marginLeft: '8px', borderRadius: '4px' }}
            >
              {getPriorityText(task.priority)}
            </Tag>
          </div>
          
          <Text style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px' }}>
            {task.processNumber}
          </Text>
          
          <div style={{ marginBottom: '8px' }}>
            {task.tags.map(tag => (
              <Tag key={tag} size="small" style={{ margin: '1px', borderRadius: '4px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size={24} icon={<UserOutlined />} />
            <Text style={{ fontSize: '12px', color: '#666' }}>{task.assignee}</Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CalendarOutlined style={{ fontSize: '12px', color: isOverdue ? '#ff4d4f' : '#666' }} />
            <Text style={{ 
              fontSize: '11px', 
              color: isOverdue ? '#ff4d4f' : '#666' 
            }}>
              {dayjs(task.dueDate).format('DD/MM')}
            </Text>
          </div>
        </div>
        
        {task.progress > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text style={{ fontSize: '11px', color: '#666' }}>Progresso</Text>
              <Text style={{ fontSize: '11px', color: '#666' }}>{task.progress}%</Text>
            </div>
            <div 
              style={{
                width: '100%',
                height: '4px',
                background: '#f0f0f0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  width: `${task.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Kanban de Tarefas
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Visualização em colunas das tarefas de cálculo
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
              placeholder="Buscar tarefas..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: '12px' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Responsável"
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              <Option value="Carlos Lima">Carlos Lima</Option>
              <Option value="Ana Santos">Ana Santos</Option>
              <Option value="Maria Costa">Maria Costa</Option>
              <Option value="Roberto Silva">Roberto Silva</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Prioridade"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todas</Option>
              <Option value="high">Alta</Option>
              <Option value="medium">Média</Option>
              <Option value="low">Baixa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateTask}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                  border: 'none'
                }}
              >
                Nova Tarefa
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

      {/* Kanban Board */}
      <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        <Row gutter={[16, 16]} style={{ minWidth: '1200px' }}>
          {filteredColumns.map((column) => (
            <Col xs={24} sm={12} lg={6} key={column.id}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: column.color
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>{column.title}</span>
                    </div>
                    <Badge 
                      count={column.tasks.length} 
                      style={{ 
                        backgroundColor: column.color,
                        color: 'white'
                      }} 
                    />
                  </div>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  height: 'calc(100vh - 300px)',
                  minHeight: '600px'
                }}
                bodyStyle={{ 
                  padding: '16px',
                  height: 'calc(100% - 57px)',
                  overflowY: 'auto'
                }}
                headStyle={{
                  borderBottom: '1px solid #f0f0f0',
                  padding: '0 16px',
                  height: '57px'
                }}
              >
                <div style={{ minHeight: '100%' }}>
                  {column.tasks.length === 0 ? (
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
                      <FileTextOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <Text style={{ color: '#999' }}>Nenhuma tarefa</Text>
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Modal para criar/editar tarefa */}
      <Modal
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
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
            label="Título da Tarefa"
            name="title"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: Cálculo de Rescisão Trabalhista" />
          </Form.Item>
          
          <Form.Item
            label="Descrição"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Descreva os detalhes da tarefa..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Processo Relacionado"
                name="processNumber"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Ex: 1001234-56.2024.8.26.0001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Responsável"
                name="assignee"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o responsável">
                  <Option value="Carlos Lima">Carlos Lima</Option>
                  <Option value="Ana Santos">Ana Santos</Option>
                  <Option value="Maria Costa">Maria Costa</Option>
                  <Option value="Roberto Silva">Roberto Silva</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Status">
                  <Option value="todo">A Fazer</Option>
                  <Option value="in_progress">Em Andamento</Option>
                  <Option value="review">Em Revisão</Option>
                  <Option value="done">Concluído</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Prioridade"
                name="priority"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Prioridade">
                  <Option value="low">Baixa</Option>
                  <Option value="medium">Média</Option>
                  <Option value="high">Alta</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Data de Vencimento"
                name="dueDate"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Tags"
            name="tags"
          >
            <Select mode="tags" placeholder="Adicione tags">
              <Option value="Urgente">Urgente</Option>
              <Option value="Trabalhista">Trabalhista</Option>
              <Option value="Cálculo">Cálculo</Option>
              <Option value="Documentação">Documentação</Option>
              <Option value="Parecer">Parecer</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
