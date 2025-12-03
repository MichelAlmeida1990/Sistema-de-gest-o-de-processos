import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Divider,
  Tag,
  Statistic,
  Table,
  message,
  Progress,
  Collapse,
  List,
  Badge,
  Modal
} from 'antd'
import {
  FileSearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { legalDiagnosisService, Diagnosis, DiagnosisCreate } from '../services/legalDiagnosisService'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse

export const LegalDiagnosisPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [error, setError] = useState<string | null>(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null)

  useEffect(() => {
    loadDiagnoses()
  }, [])

  const loadDiagnoses = async () => {
    try {
      const response = await legalDiagnosisService.listDiagnoses()
      setDiagnoses(response.diagnoses)
    } catch (err: any) {
      console.error('Erro ao carregar diagnósticos:', err)
    }
  }

  const onFinish = async (values: DiagnosisCreate) => {
    setLoading(true)
    setError(null)
    setDiagnosis(null)

    try {
      const newDiagnosis = await legalDiagnosisService.createDiagnosis(values)
      setDiagnosis(newDiagnosis)
      message.success('Diagnóstico criado com sucesso!')
      form.resetFields()
      loadDiagnoses()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao criar diagnóstico'
      setError(errorMsg)
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAnalyze = async () => {
    const description = form.getFieldValue('case_description')
    if (!description || description.trim().length < 20) {
      message.warning('Por favor, descreva o caso com pelo menos 20 caracteres')
      return
    }

    setAnalyzing(true)
    try {
      const category = form.getFieldValue('case_category')
      const caseType = form.getFieldValue('case_type')
      
      const result = await legalDiagnosisService.analyzeText({
        text: description,
        category: category,
        case_type: caseType
      })

      if (result.success && result.analysis) {
        message.success('Análise concluída!')
        // Preencher campos com resultados da análise rápida
        form.setFieldsValue({
          case_category: result.analysis.category || category,
          case_type: result.analysis.type || caseType
        })
      }
    } catch (err: any) {
      message.error('Erro ao analisar texto')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReanalyze = async (id: number) => {
    try {
      const updated = await legalDiagnosisService.reanalyzeDiagnosis(id)
      setDiagnosis(updated)
      message.success('Diagnóstico reanalisado!')
      loadDiagnoses()
    } catch (err: any) {
      message.error('Erro ao reanalisar diagnóstico')
    }
  }

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'green'
      default:
        return 'default'
    }
  }

  const getRiskLabel = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'Alto'
      case 'medium':
        return 'Médio'
      case 'low':
        return 'Baixo'
      default:
        return 'Não definido'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'analyzing':
        return 'processing'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'analyzing':
        return 'Analisando'
      case 'failed':
        return 'Falhou'
      case 'pending':
        return 'Pendente'
      default:
        return status
    }
  }

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'client_name',
      key: 'client_name',
    },
    {
      title: 'Categoria',
      dataIndex: 'case_category',
      key: 'case_category',
      render: (text: string) => text || '-'
    },
    {
      title: 'Probabilidade',
      dataIndex: 'success_probability',
      key: 'success_probability',
      render: (value: number) => value ? `${value.toFixed(1)}%` : '-'
    },
    {
      title: 'Risco',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (risk: string) => (
        <Tag color={getRiskColor(risk)}>{getRiskLabel(risk)}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={getStatusLabel(status)} />
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Diagnosis) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDiagnosis(record)
              setViewModalVisible(true)
            }}
          >
            Ver
          </Button>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleReanalyze(record.id)}
            loading={analyzing}
          >
            Reanalisar
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Formulário de Diagnóstico */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileSearchOutlined />
                <span>Novo Diagnóstico Jurídico</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                icon={<InfoCircleOutlined />}
                onClick={() => {
                  Modal.info({
                    title: 'Como usar o Diagnóstico Jurídico',
                    content: (
                      <div>
                        <p>1. Preencha os dados do cliente e descrição do caso</p>
                        <p>2. Clique em "Análise Rápida" para uma prévia</p>
                        <p>3. Clique em "Criar Diagnóstico" para análise completa com IA</p>
                        <p>4. O sistema irá analisar e gerar relatório com probabilidade de êxito</p>
                      </div>
                    )
                  })
                }}
              >
                Ajuda
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="client_name"
                label="Nome do Cliente"
                rules={[{ required: true, message: 'Nome do cliente é obrigatório' }]}
              >
                <Input placeholder="Nome completo do cliente" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="client_email"
                    label="Email"
                  >
                    <Input type="email" placeholder="email@exemplo.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="client_phone"
                    label="Telefone"
                  >
                    <Input placeholder="(11) 99999-9999" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="client_document"
                label="CPF/CNPJ"
              >
                <Input placeholder="000.000.000-00" />
              </Form.Item>

              <Form.Item
                name="case_category"
                label="Categoria do Caso"
              >
                <Select placeholder="Selecione a categoria">
                  <Option value="Trabalhista">Trabalhista</Option>
                  <Option value="Civil">Civil</Option>
                  <Option value="Criminal">Criminal</Option>
                  <Option value="Tributário">Tributário</Option>
                  <Option value="Empresarial">Empresarial</Option>
                  <Option value="Família">Família</Option>
                  <Option value="Previdenciário">Previdenciário</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="case_type"
                label="Tipo de Caso"
              >
                <Select placeholder="Selecione o tipo">
                  <Option value="Rescisão">Rescisão</Option>
                  <Option value="Cobrança">Cobrança</Option>
                  <Option value="Danos Morais">Danos Morais</Option>
                  <Option value="Danos Materiais">Danos Materiais</Option>
                  <Option value="Revisional">Revisional</Option>
                  <Option value="Outro">Outro</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="case_description"
                label="Descrição do Caso"
                rules={[
                  { required: true, message: 'Descrição do caso é obrigatória' },
                  { min: 20, message: 'Descrição deve ter pelo menos 20 caracteres' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Descreva detalhadamente a situação jurídica do cliente..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="default"
                    icon={<InfoCircleOutlined />}
                    onClick={handleQuickAnalyze}
                    loading={analyzing}
                  >
                    Análise Rápida
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<FileSearchOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Criar Diagnóstico
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            {error && (
              <Alert
                message="Erro"
                description={error}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* Resultado do Diagnóstico */}
        <Col xs={24} lg={12}>
          {diagnosis ? (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Resultado do Diagnóstico</span>
                </Space>
              }
              extra={
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => handleReanalyze(diagnosis.id)}
                >
                  Reanalisar
                </Button>
              }
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Estatísticas */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Probabilidade de Êxito"
                      value={diagnosis.success_probability || 0}
                      suffix="%"
                      valueStyle={{ color: diagnosis.success_probability && diagnosis.success_probability > 70 ? '#3f8600' : diagnosis.success_probability && diagnosis.success_probability > 50 ? '#cf1322' : '#cf1322' }}
                    />
                    <Progress
                      percent={diagnosis.success_probability || 0}
                      status={diagnosis.success_probability && diagnosis.success_probability > 70 ? 'success' : 'exception'}
                      showInfo={false}
                      style={{ marginTop: 8 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Nível de Risco"
                      value={getRiskLabel(diagnosis.risk_level)}
                      valueStyle={{ color: getRiskColor(diagnosis.risk_level) === 'red' ? '#cf1322' : getRiskColor(diagnosis.risk_level) === 'orange' ? '#fa8c16' : '#3f8600' }}
                    />
                    <Tag color={getRiskColor(diagnosis.risk_level)} style={{ marginTop: 8 }}>
                      {getRiskLabel(diagnosis.risk_level)}
                    </Tag>
                  </Col>
                </Row>

                <Divider />

                {/* Questões Chave */}
                {diagnosis.key_issues && diagnosis.key_issues.length > 0 && (
                  <div>
                    <Title level={5}>
                      <WarningOutlined /> Questões Chave Identificadas
                    </Title>
                    <List
                      size="small"
                      dataSource={diagnosis.key_issues}
                      renderItem={(item, index) => (
                        <List.Item>
                          <Text>{index + 1}. {item}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {/* Soluções Possíveis */}
                {diagnosis.possible_solutions && diagnosis.possible_solutions.length > 0 && (
                  <div>
                    <Title level={5}>
                      <CheckCircleOutlined /> Possíveis Soluções
                    </Title>
                    <List
                      size="small"
                      dataSource={diagnosis.possible_solutions}
                      renderItem={(item, index) => (
                        <List.Item>
                          <Text>{index + 1}. {item}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {/* Recomendações */}
                {diagnosis.recommendations && (
                  <div>
                    <Title level={5}>
                      <InfoCircleOutlined /> Recomendações
                    </Title>
                    <Paragraph>{diagnosis.recommendations}</Paragraph>
                  </div>
                )}

                {/* Informações Adicionais */}
                <Collapse>
                  <Panel header="Informações Adicionais" key="1">
                    {diagnosis.estimated_value && (
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Valor Estimado: </Text>
                        <Text>R$ {diagnosis.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                      </div>
                    )}
                    {diagnosis.estimated_duration && (
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Duração Estimada: </Text>
                        <Text>{diagnosis.estimated_duration}</Text>
                      </div>
                    )}
                    <div>
                      <Text strong>Status: </Text>
                      <Badge status={getStatusColor(diagnosis.status) as any} text={getStatusLabel(diagnosis.status)} />
                    </div>
                  </Panel>
                </Collapse>
              </Space>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FileSearchOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <Text type="secondary">
                  Crie um diagnóstico para ver os resultados aqui
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Lista de Diagnósticos */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <FileSearchOutlined />
                <span>Diagnósticos Anteriores</span>
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={loadDiagnoses}
              >
                Atualizar
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={diagnoses}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de Visualização */}
      <Modal
        title="Detalhes do Diagnóstico"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false)
          setSelectedDiagnosis(null)
        }}
        footer={null}
        width={800}
      >
        {selectedDiagnosis && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>Cliente: </Text>
                <Text>{selectedDiagnosis.client_name}</Text>
              </div>
              <div>
                <Text strong>Descrição: </Text>
                <Paragraph>{selectedDiagnosis.case_description}</Paragraph>
              </div>
              {selectedDiagnosis.success_probability && (
                <div>
                  <Text strong>Probabilidade de Êxito: </Text>
                  <Text>{selectedDiagnosis.success_probability.toFixed(1)}%</Text>
                  <Progress
                    percent={selectedDiagnosis.success_probability}
                    status={selectedDiagnosis.success_probability > 70 ? 'success' : 'exception'}
                  />
                </div>
              )}
              {selectedDiagnosis.key_issues && selectedDiagnosis.key_issues.length > 0 && (
                <div>
                  <Title level={5}>Questões Chave:</Title>
                  <List
                    dataSource={selectedDiagnosis.key_issues}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  />
                </div>
              )}
              {selectedDiagnosis.recommendations && (
                <div>
                  <Title level={5}>Recomendações:</Title>
                  <Paragraph>{selectedDiagnosis.recommendations}</Paragraph>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}



