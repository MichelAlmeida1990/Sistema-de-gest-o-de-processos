import React, { useState, useEffect } from 'react'
import {
  Card, Button, Form, Input, Switch, message, Space, Typography,
  Divider, Tag, Alert, Descriptions, Tabs, Table, Statistic, Row, Col,
  Modal, Tooltip, Badge
} from 'antd'
import {
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  ApiOutlined, LinkOutlined, UserOutlined, DollarOutlined,
  SettingOutlined, InfoCircleOutlined, ReloadOutlined
} from '@ant-design/icons'
import { rdstationService, RDStationStatus, Contact, Deal, ProcessSyncData } from '../services/rdstationService'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

export const RDStationPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<RDStationStatus | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [form] = Form.useForm()
  const [syncForm] = Form.useForm()

  // Carregar status ao montar componente
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const statusData = await rdstationService.getStatus()
      setStatus(statusData)
    } catch (error: any) {
      message.error('Erro ao carregar status do RD Station')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setLoading(true)
      const statusData = await rdstationService.getStatus()
      setTestResult({
        success: true,
        message: 'Conexão com RD Station estabelecida com sucesso!',
        data: statusData
      })
      message.success('Conexão testada com sucesso!')
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Erro ao conectar com RD Station',
        error: error.response?.data?.detail || error.message
      })
      message.error('Erro ao testar conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContact = async (values: any) => {
    try {
      setLoading(true)
      const contact: Contact = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
        custom_fields: values.custom_fields ? JSON.parse(values.custom_fields) : {}
      }
      
      const result = await rdstationService.createContact(contact)
      message.success('Contato criado com sucesso no RD Station!')
      form.resetFields()
      return result
    } catch (error: any) {
      message.error('Erro ao criar contato: ' + (error.response?.data?.detail || error.message))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProcess = async (values: any) => {
    try {
      setLoading(true)
      const processData: ProcessSyncData = {
        client_name: values.client_name,
        client_email: values.client_email,
        client_phone: values.client_phone,
        process_number: values.process_number,
        status: values.status,
        estimated_value: values.estimated_value,
        type: values.type
      }
      
      const result = await rdstationService.syncProcess(processData)
      setSyncResult(result)
      
      if (result.success) {
        message.success('Processo sincronizado com sucesso no RD Station!')
      } else {
        message.warning(result.message || 'Sincronização concluída com avisos')
      }
      
      syncForm.resetFields()
      return result
    } catch (error: any) {
      message.error('Erro ao sincronizar processo: ' + (error.response?.data?.detail || error.message))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async () => {
    try {
      setLoading(true)
      const event = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          email: 'teste@exemplo.com',
          name: 'Teste de Evento',
          conversion_identifier: 'teste-conversion-' + Date.now()
        }
      }
      
      await rdstationService.addEvent(event)
      message.success('Evento adicionado com sucesso no RD Station!')
    } catch (error: any) {
      message.error('Erro ao adicionar evento: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Cabeçalho */}
        <Card>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={2}>
              <ApiOutlined /> Integração RD Station
            </Title>
            <Paragraph>
              Configure e gerencie a integração com o RD Station para automação de marketing e CRM.
            </Paragraph>
          </Space>
        </Card>

        {/* Status */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              Status da Integração
            </Space>
          }
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={loadStatus}
              loading={loading}
            >
              Atualizar
            </Button>
          }
        >
          {status ? (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Status">
                <Tag color={status.enabled ? 'green' : 'red'}>
                  {status.enabled ? (
                    <><CheckCircleOutlined /> Habilitado</>
                  ) : (
                    <><CloseCircleOutlined /> Desabilitado</>
                  )}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Token API">
                <Tag color={status.api_token_configured ? 'green' : 'red'}>
                  {status.api_token_configured ? 'Configurado' : 'Não Configurado'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Token Público">
                <Tag color={status.public_token_configured ? 'green' : 'red'}>
                  {status.public_token_configured ? 'Configurado' : 'Não Configurado'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Base URL">
                {status.base_url}
              </Descriptions.Item>
              <Descriptions.Item label="Versão API">
                {status.api_version}
              </Descriptions.Item>
              <Descriptions.Item label="Última Verificação">
                {new Date(status.last_check).toLocaleString('pt-BR')}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Alert
              message="Status não disponível"
              description="Não foi possível carregar o status da integração."
              type="warning"
            />
          )}

          {status && !status.enabled && (
            <Alert
              message="RD Station Desabilitado"
              description={
                <div>
                  <Paragraph>
                    Para habilitar a integração, configure as variáveis de ambiente:
                  </Paragraph>
                  <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                    RDSTATION_API_TOKEN=seu_token_api_aqui{'\n'}
                    RDSTATION_PUBLIC_TOKEN=seu_token_publico_aqui{'\n'}
                    RDSTATION_ENABLED=true
                  </pre>
                  <Paragraph>
                    <a href="https://app.rdstation.com.br/configuracoes/integracoes/api" target="_blank" rel="noopener noreferrer">
                      Obter tokens do RD Station
                    </a>
                  </Paragraph>
                </div>
              }
              type="info"
              style={{ marginTop: '16px' }}
            />
          )}
        </Card>

        {/* Teste de Conexão */}
        <Card
          title={
            <Space>
              <SyncOutlined />
              Teste de Conexão
            </Space>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={handleTestConnection}
              loading={loading}
            >
              Testar Conexão
            </Button>

            {testResult && (
              <Alert
                message={testResult.message}
                type={testResult.success ? 'success' : 'error'}
                description={testResult.error && (
                  <Text type="danger">{testResult.error}</Text>
                )}
              />
            )}
          </Space>
        </Card>

        {/* Funcionalidades */}
        <Card>
          <Tabs defaultActiveKey="sync">
            <TabPane
              tab={
                <span>
                  <LinkOutlined />
                  Sincronizar Processo
                </span>
              }
              key="sync"
            >
              <Form
                form={syncForm}
                layout="vertical"
                onFinish={handleSyncProcess}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="client_name"
                      label="Nome do Cliente"
                      rules={[{ required: true, message: 'Nome do cliente é obrigatório' }]}
                    >
                      <Input placeholder="Nome completo do cliente" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="client_email"
                      label="Email do Cliente"
                      rules={[
                        { required: true, message: 'Email é obrigatório' },
                        { type: 'email', message: 'Email inválido' }
                      ]}
                    >
                      <Input placeholder="email@exemplo.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="client_phone"
                      label="Telefone do Cliente"
                    >
                      <Input placeholder="(11) 99999-9999" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="process_number"
                      label="Número do Processo"
                      rules={[{ required: true, message: 'Número do processo é obrigatório' }]}
                    >
                      <Input placeholder="1234567-89.2024.8.26.0001" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="status"
                      label="Status do Processo"
                      rules={[{ required: true, message: 'Status é obrigatório' }]}
                    >
                      <Input placeholder="IN_PROGRESS" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="estimated_value"
                      label="Valor Estimado"
                    >
                      <Input type="number" placeholder="0.00" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="type"
                  label="Tipo de Processo"
                >
                  <Input placeholder="Trabalhista, Civil, etc." />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SyncOutlined />}
                  >
                    Sincronizar com RD Station
                  </Button>
                </Form.Item>
              </Form>

              {syncResult && (
                <Alert
                  message={syncResult.success ? 'Sincronização Concluída' : 'Erro na Sincronização'}
                  type={syncResult.success ? 'success' : 'error'}
                  description={
                    <div>
                      <Paragraph>{syncResult.message}</Paragraph>
                      {syncResult.contact && (
                        <Paragraph>
                          <strong>Contato:</strong> {syncResult.contact.name} (ID: {syncResult.contact.id})
                        </Paragraph>
                      )}
                      {syncResult.deal && (
                        <Paragraph>
                          <strong>Oportunidade:</strong> {syncResult.deal.name} (ID: {syncResult.deal.id})
                        </Paragraph>
                      )}
                    </div>
                  }
                  style={{ marginTop: '16px' }}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Criar Contato
                </span>
              }
              key="contact"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateContact}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Nome"
                      rules={[{ required: true, message: 'Nome é obrigatório' }]}
                    >
                      <Input placeholder="Nome completo" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Email é obrigatório' },
                        { type: 'email', message: 'Email inválido' }
                      ]}
                    >
                      <Input placeholder="email@exemplo.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="Telefone"
                    >
                      <Input placeholder="(11) 99999-9999" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="company"
                      label="Empresa"
                    >
                      <Input placeholder="Nome da empresa" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="tags"
                  label="Tags (separadas por vírgula)"
                >
                  <Input placeholder="processo, cliente, vip" />
                </Form.Item>

                <Form.Item
                  name="custom_fields"
                  label="Campos Personalizados (JSON)"
                >
                  <TextArea
                    rows={4}
                    placeholder='{"campo1": "valor1", "campo2": "valor2"}'
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<UserOutlined />}
                  >
                    Criar Contato
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <DollarOutlined />
                  Eventos
                </span>
              }
              key="events"
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Paragraph>
                  Adicione eventos de conversão no RD Station para rastrear ações dos usuários.
                </Paragraph>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={handleAddEvent}
                  loading={loading}
                >
                  Adicionar Evento de Teste
                </Button>
              </Space>
            </TabPane>
          </Tabs>
        </Card>

        {/* Informações */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              Informações
            </Space>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph>
              <strong>RD Station</strong> é uma plataforma de automação de marketing e CRM
              amplamente utilizada por escritórios jurídicos.
            </Paragraph>
            <Paragraph>
              <strong>Funcionalidades disponíveis:</strong>
            </Paragraph>
            <ul>
              <li>Gestão de contatos e clientes</li>
              <li>Criação de oportunidades (deals)</li>
              <li>Sincronização automática de processos</li>
              <li>Eventos de conversão</li>
              <li>Webhooks para integração bidirecional</li>
            </ul>
            <Paragraph>
              <a
                href="https://developers.rdstation.com/pt-BR/reference"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentação da API RD Station
              </a>
            </Paragraph>
          </Space>
        </Card>
      </Space>
    </div>
  )
}

