import React, { useState } from 'react'
import { 
  Row, Col, Card, Table, Button, Input, Select, DatePicker, 
  Tag, Space, Typography, Modal, Form, message, Tooltip,
  Badge, Avatar, Statistic, Tabs, Switch, Divider
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  UserOutlined, SettingOutlined, BellOutlined, LockOutlined, KeyOutlined,
  CalendarOutlined, DatabaseOutlined, SecurityScanOutlined, AuditOutlined,
  TeamOutlined, CrownOutlined, CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
  createdAt: string
  permissions: string[]
}

interface SystemConfig {
  maintenanceMode: boolean
  emailNotifications: boolean
  autoBackup: boolean
  sessionTimeout: number
  maxFileSize: number
}

export const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  // Dados mockados
  const usersData: User[] = [
    {
      id: '1',
      name: 'Carlos Lima',
      email: 'carlos.lima@exemplo.com',
      role: 'admin',
      status: 'Ativo',
      lastLogin: '2024-01-20 14:30',
      createdAt: '2024-01-01',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: '2',
      name: 'Ana Santos',
      email: 'ana.santos@exemplo.com',
      role: 'manager',
      status: 'Ativo',
      lastLogin: '2024-01-19 09:15',
      createdAt: '2024-01-02',
      permissions: ['read', 'write']
    },
    {
      id: '3',
      name: 'Maria Costa',
      email: 'maria.costa@exemplo.com',
      role: 'user',
      status: 'Inativo',
      lastLogin: '2024-01-15 16:45',
      createdAt: '2024-01-03',
      permissions: ['read']
    }
  ]

  const systemConfig: SystemConfig = {
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    sessionTimeout: 30,
    maxFileSize: 10
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red'
      case 'manager': return 'blue'
      case 'user': return 'green'
      default: return 'default'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'manager': return 'Gerente'
      case 'user': return 'Usuário'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'success'
      case 'Inativo': return 'error'
      case 'Pendente': return 'warning'
      default: return 'default'
    }
  }

  const userColumns = [
    {
      title: 'Usuário',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
            <div style={{ marginTop: '2px' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>{record.email}</Text>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={getRoleColor(role)} style={{ borderRadius: '8px' }}>
          {getRoleDisplayName(role)}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: '8px' }}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Último Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: '13px' }}>{date}</Text>
      )
    },
    {
      title: 'Permissões',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 150,
      render: (permissions: string[]) => (
        <div>
          {permissions.map(permission => (
            <Tag key={permission} size="small" style={{ margin: '1px', borderRadius: '4px' }}>
              {permission}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record: User) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditUser(record)}
              style={{ borderRadius: '8px' }}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              style={{ borderRadius: '8px' }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setIsModalVisible(true)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingUser) {
        message.success('Usuário atualizado com sucesso!')
      } else {
        message.success('Usuário criado com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const stats = [
    {
      title: 'Total de Usuários',
      value: usersData.length,
      icon: <TeamOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Usuários Ativos',
      value: usersData.filter(u => u.status === 'Ativo').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Administradores',
      value: usersData.filter(u => u.role === 'admin').length,
      icon: <CrownOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Sistema Online',
      value: '99.9%',
      icon: <SecurityScanOutlined />,
      color: '#52c41a'
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Administração do Sistema
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Gerencie usuários, configurações e segurança do sistema
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>
                    {stat.title}
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Statistic
                      value={stat.value}
                      valueStyle={{ 
                        color: stat.color, 
                        fontSize: '24px', 
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    background: `${stat.color}20`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Tabs defaultActiveKey="users" size="large">
          {/* Tab Usuários */}
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Usuários
              </span>
            } 
            key="users"
          >
            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Buscar usuários..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: '12px' }}
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Select
                  placeholder="Função"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  style={{ width: '100%', borderRadius: '12px' }}
                >
                  <Option value="all">Todas</Option>
                  <Option value="admin">Administrador</Option>
                  <Option value="manager">Gerente</Option>
                  <Option value="user">Usuário</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateUser}
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                    border: 'none'
                  }}
                >
                  Novo Usuário
                </Button>
              </Col>
            </Row>

            {/* Users Table */}
            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredUsers.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} usuários`,
                style: { marginTop: '16px' }
              }}
              scroll={{ x: 1000 }}
              size="middle"
            />
          </TabPane>

          {/* Tab Configurações */}
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Configurações
              </span>
            } 
            key="settings"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Configurações do Sistema" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Modo de Manutenção</Text>
                        <div>
                          <Text style={{ fontSize: '12px', color: '#666' }}>
                            Ativar quando necessário realizar manutenção
                          </Text>
                        </div>
                      </div>
                      <Switch defaultChecked={systemConfig.maintenanceMode} />
                    </div>
                    
                    <Divider />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Notificações por Email</Text>
                        <div>
                          <Text style={{ fontSize: '12px', color: '#666' }}>
                            Enviar notificações automáticas por email
                          </Text>
                        </div>
                      </div>
                      <Switch defaultChecked={systemConfig.emailNotifications} />
                    </div>
                    
                    <Divider />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Backup Automático</Text>
                        <div>
                          <Text style={{ fontSize: '12px', color: '#666' }}>
                            Realizar backup diário dos dados
                          </Text>
                        </div>
                      </div>
                      <Switch defaultChecked={systemConfig.autoBackup} />
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Configurações de Segurança" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                      <Text strong>Timeout de Sessão (minutos)</Text>
                      <Input 
                        defaultValue={systemConfig.sessionTimeout}
                        style={{ marginTop: '8px', borderRadius: '8px' }}
                        suffix="min"
                      />
                    </div>
                    
                    <div>
                      <Text strong>Tamanho Máximo de Arquivo (MB)</Text>
                      <Input 
                        defaultValue={systemConfig.maxFileSize}
                        style={{ marginTop: '8px', borderRadius: '8px' }}
                        suffix="MB"
                      />
                    </div>
                    
                    <Button 
                      type="primary" 
                      icon={<SecurityScanOutlined />}
                      style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                        border: 'none',
                        marginTop: '16px'
                      }}
                    >
                      Executar Verificação de Segurança
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab Auditoria */}
          <TabPane 
            tab={
              <span>
                <AuditOutlined />
                Auditoria
              </span>
            } 
            key="audit"
          >
            <Card title="Logs de Auditoria" size="small">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <AuditOutlined style={{ fontSize: '48px', color: '#031f5f', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#031f5f' }}>
                  Logs de Auditoria
                </Title>
                <Text style={{ color: '#666' }}>
                  Visualize e gerencie os logs de auditoria do sistema
                </Text>
                <div style={{ marginTop: '16px' }}>
                  <Button 
                    type="primary"
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                      border: 'none'
                    }}
                  >
                    Visualizar Logs
                  </Button>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal para criar/editar usuário */}
      <Modal
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nome"
                name="name"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Nome completo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Campo obrigatório' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Função"
                name="role"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione a função">
                  <Option value="admin">Administrador</Option>
                  <Option value="manager">Gerente</Option>
                  <Option value="user">Usuário</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Status">
                  <Option value="Ativo">Ativo</Option>
                  <Option value="Inativo">Inativo</Option>
                  <Option value="Pendente">Pendente</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Permissões"
            name="permissions"
          >
            <Select mode="multiple" placeholder="Selecione as permissões">
              <Option value="read">Leitura</Option>
              <Option value="write">Escrita</Option>
              <Option value="delete">Exclusão</Option>
              <Option value="admin">Administração</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}