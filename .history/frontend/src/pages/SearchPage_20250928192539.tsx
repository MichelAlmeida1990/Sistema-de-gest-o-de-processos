import React, { useState } from 'react'
import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Space, 
  Tabs, 
  List, 
  Avatar, 
  Tag,
  Empty,
  Row,
  Col
} from 'antd'
import { 
  SearchOutlined, 
  FileTextOutlined, 
  CheckSquareOutlined, 
  SendOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input
const { TabPane } = Tabs

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Dados mock para demonstração
  const searchResults = {
    processes: [
      {
        id: 1,
        title: 'Contrato de Prestação de Serviços',
        description: 'Processo relacionado à contratação de serviços jurídicos',
        status: 'Em andamento',
        date: '2024-01-15',
        type: 'process'
      },
      {
        id: 2,
        title: 'Ação Trabalhista - João Silva',
        description: 'Processo trabalhista contra empresa XYZ',
        status: 'Concluído',
        date: '2024-01-10',
        type: 'process'
      }
    ],
    tasks: [
      {
        id: 1,
        title: 'Revisar documentação',
        description: 'Revisar todos os documentos do processo #12345',
        status: 'Pendente',
        priority: 'Alta',
        type: 'task'
      },
      {
        id: 2,
        title: 'Entregar relatório',
        description: 'Preparar relatório mensal de atividades',
        status: 'Em andamento',
        priority: 'Média',
        type: 'task'
      }
    ],
    deliveries: [
      {
        id: 1,
        title: 'Entrega de Documentos',
        description: 'Entrega de documentos ao cliente ABC',
        status: 'Entregue',
        date: '2024-01-20',
        type: 'delivery'
      }
    ],
    financial: [
      {
        id: 1,
        title: 'Pagamento de Honorários',
        description: 'Pagamento referente ao processo #12345',
        amount: 'R$ 5.000,00',
        status: 'Pago',
        date: '2024-01-18',
        type: 'financial'
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'entregue':
      case 'pago':
        return 'green'
      case 'em andamento':
        return 'blue'
      case 'pendente':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'red'
      case 'média':
        return 'orange'
      case 'baixa':
        return 'green'
      default:
        return 'default'
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'process':
        return <FileTextOutlined />
      case 'task':
        return <CheckSquareOutlined />
      case 'delivery':
        return <SendOutlined />
      case 'financial':
        return <DollarOutlined />
      default:
        return <FileTextOutlined />
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    console.log('Buscar por:', value)
  }

  const renderResults = (items: any[], type: string) => {
    if (items.length === 0) {
      return <Empty description="Nenhum resultado encontrado" />
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(25, 25, 112, 0.1)',
              marginBottom: '8px'
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={getIcon(item.type)}
                  style={{
                    background: '#191970'
                  }}
                />
              }
              title={
                <Space>
                  <Text strong>{item.title}</Text>
                  <Tag color={getStatusColor(item.status)}>
                    {item.status}
                  </Tag>
                  {item.priority && (
                    <Tag color={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Tag>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text>{item.description}</Text>
                  <Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <ClockCircleOutlined /> {item.date}
                    </Text>
                    {item.amount && (
                      <Text strong style={{ color: '#52c41a' }}>
                        {item.amount}
                      </Text>
                    )}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#191970' }}>
          <SearchOutlined style={{ marginRight: '12px' }} />
          Busca Global
        </Title>
        <Text type="secondary">
          Encontre processos, tarefas, entregas e informações financeiras
        </Text>
      </div>

      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(100, 149, 237, 0.05) 100%)',
          border: '1px solid rgba(25, 25, 112, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={18} md={20}>
            <Search
              placeholder="Digite sua busca..."
              allowClear
              enterButton={
                <Button type="primary" icon={<SearchOutlined />}>
                  Buscar
                </Button>
              }
              size="large"
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Button 
              size="large" 
              style={{ width: '100%' }}
              icon={<UserOutlined />}
            >
              Filtros
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(100, 149, 237, 0.05) 100%)',
          border: '1px solid rgba(25, 25, 112, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: '16px' }}
        >
          <TabPane tab="Todos os Resultados" key="all">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {searchTerm && (
                <>
                  <Title level={4}>Processos</Title>
                  {renderResults(searchResults.processes, 'processes')}
                  
                  <Title level={4}>Tarefas</Title>
                  {renderResults(searchResults.tasks, 'tasks')}
                  
                  <Title level={4}>Entregas</Title>
                  {renderResults(searchResults.deliveries, 'deliveries')}
                  
                  <Title level={4}>Financeiro</Title>
                  {renderResults(searchResults.financial, 'financial')}
                </>
              )}
              {!searchTerm && (
                <Empty 
                  description="Digite algo para começar a buscar"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Space>
          </TabPane>
          
          <TabPane tab="Processos" key="processes">
            {renderResults(searchResults.processes, 'processes')}
          </TabPane>
          
          <TabPane tab="Tarefas" key="tasks">
            {renderResults(searchResults.tasks, 'tasks')}
          </TabPane>
          
          <TabPane tab="Entregas" key="deliveries">
            {renderResults(searchResults.deliveries, 'deliveries')}
          </TabPane>
          
          <TabPane tab="Financeiro" key="financial">
            {renderResults(searchResults.financial, 'financial')}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}
