import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Divider,
  Tag,
  List,
  Collapse,
  Tabs,
  message,
  Spin,
  Empty
} from 'antd'
import {
  FileSearchOutlined,
  MessageOutlined,
  SwapOutlined,
  BulbOutlined,
  ReloadOutlined,
  SendOutlined,
  UserOutlined,
  RobotOutlined
} from '@ant-design/icons'
import {
  jurisprudenceService,
  Jurisprudence,
  JurisprudenceCreate,
  ChatMessage,
  ChatRequest,
  CompareRequest
} from '../services/jurisprudenceService'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Panel } = Collapse
const { TabPane } = Tabs

export const JurisprudencePage: React.FC = () => {
  const [form] = Form.useForm()
  const [compareForm1] = Form.useForm()
  const [compareForm2] = Form.useForm()
  const [chatForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [jurisprudence, setJurisprudence] = useState<Jurisprudence | null>(null)
  const [jurisprudences, setJurisprudences] = useState<Jurisprudence[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [compareResult, setCompareResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('analyze')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadJurisprudences()
    // Mensagem inicial do assistente
    setChatMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu assistente jurídico. Como posso ajudá-lo hoje? Posso analisar jurisprudências, comparar decisões, gerar argumentos estratégicos e muito mais.',
        timestamp: new Date().toISOString()
      }
    ])
  }, [])

  useEffect(() => {
    // Scroll para o final do chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const loadJurisprudences = async () => {
    try {
      const data = await jurisprudenceService.listJurisprudences()
      // O backend retorna uma lista diretamente
      setJurisprudences(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Erro ao carregar jurisprudências:', err)
      // Se houver erro, apenas definir lista vazia
      setJurisprudences([])
      // Não mostrar erro para o usuário se for apenas lista vazia
      if (err.response?.status !== 404) {
        message.warning('Não foi possível carregar as jurisprudências salvas')
      }
    }
  }

  const onAnalyzeFinish = async (values: JurisprudenceCreate) => {
    setLoading(true)
    setAnalyzing(true)
    setJurisprudence(null)

    try {
      const newJurisprudence = await jurisprudenceService.analyzeJurisprudence(values)
      setJurisprudence(newJurisprudence)
      message.success('Análise concluída com sucesso!')
      form.resetFields()
      loadJurisprudences()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao analisar jurisprudência'
      message.error(errorMsg)
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  const handleCompare = async () => {
    const values1 = compareForm1.getFieldsValue()
    const values2 = compareForm2.getFieldsValue()
    
    if (!values1.text1 || !values2.text2) {
      message.warning('Por favor, preencha ambos os textos')
      return
    }

    setLoading(true)
    try {
      const compareData: CompareRequest = {
        text1: values1.text1,
        text2: values2.text2,
        title1: values1.title1,
        title2: values2.title2
      }
      const result = await jurisprudenceService.compareJurisprudences(compareData)
      setCompareResult(result.comparison)
      message.success('Comparação concluída!')
    } catch (err: any) {
      message.error('Erro ao comparar jurisprudências')
    } finally {
      setLoading(false)
    }
  }

  const onChatSubmit = async (values: { message: string }) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: values.message,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatLoading(true)
    chatForm.resetFields()

    try {
      const history: ChatMessage[] = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const request: ChatRequest = {
        message: values.message,
        history: history
      }

      // Adicionar timeout de 60 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A requisição demorou muito para responder')), 60000)
      })

      const chatPromise = jurisprudenceService.chatWithAI(request)

      const response = await Promise.race([chatPromise, timeoutPromise])

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      }

      setChatMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Erro no chat:', err)
      let errorMsg = 'Desculpe, ocorreu um erro ao processar sua mensagem.'
      
      if (err.message?.includes('Timeout')) {
        errorMsg = 'A requisição demorou muito para responder. A IA pode estar temporariamente indisponível. Tente novamente em alguns instantes.'
      } else if (err.response?.data?.detail) {
        errorMsg = `Erro: ${err.response.data.detail}`
      } else if (err.message) {
        errorMsg = `Erro: ${err.message}`
      }
      
      message.error('Erro ao enviar mensagem')
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const handleSummarize = async () => {
    const text = form.getFieldValue('full_text')
    if (!text || text.trim().length < 50) {
      message.warning('Por favor, insira um texto com pelo menos 50 caracteres')
      return
    }

    setLoading(true)
    try {
      const result = await jurisprudenceService.summarizeDecision(text)
      message.success('Resumo gerado!')
      form.setFieldsValue({ summary: result.summary })
    } catch (err: any) {
      message.error('Erro ao gerar resumo')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateArguments = async () => {
    const caseDescription = form.getFieldValue('case_description') || form.getFieldValue('full_text')
    if (!caseDescription || caseDescription.trim().length < 20) {
      message.warning('Por favor, descreva o caso')
      return
    }

    setLoading(true)
    try {
      const fullText = form.getFieldValue('full_text')
      const result = await jurisprudenceService.generateArguments(
        caseDescription,
        fullText
      )
      message.success('Argumentos gerados!')
      form.setFieldsValue({ arguments: result.arguments.join('\n\n') })
    } catch (err: any) {
      message.error('Erro ao gerar argumentos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <FileSearchOutlined /> Assistente de Jurisprudência
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 16 }}>
        {/* Análise de Jurisprudência */}
        <TabPane tab={<span><FileSearchOutlined /> Análise</span>} key="analyze">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Analisar Jurisprudência">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onAnalyzeFinish}
                  autoComplete="off"
                >
                  <Form.Item
                    name="title"
                    label="Título/Resumo"
                    rules={[{ required: true, message: 'Título é obrigatório' }]}
                  >
                    <Input placeholder="Ex: Recurso sobre danos morais" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="process_number" label="Número do Processo">
                        <Input placeholder="0000000-00.0000.0.00.0000" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="tribunal" label="Tribunal">
                        <Input placeholder="TJSP, TRF4, etc." />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="full_text"
                    label="Texto da Decisão"
                    rules={[
                      { required: true, message: 'Texto da decisão é obrigatório' },
                      { min: 50, message: 'Texto deve ter pelo menos 50 caracteres' }
                    ]}
                  >
                    <TextArea
                      rows={10}
                      placeholder="Cole aqui o texto completo da decisão/jurisprudência..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="default"
                        onClick={handleSummarize}
                        loading={loading}
                      >
                        Gerar Resumo
                      </Button>
                      <Button
                        type="default"
                        onClick={handleGenerateArguments}
                        loading={loading}
                        icon={<BulbOutlined />}
                      >
                        Gerar Argumentos
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<FileSearchOutlined />}
                        loading={analyzing}
                        size="large"
                      >
                        Analisar com IA
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              {jurisprudence ? (
                <Card
                  title="Resultado da Análise"
                  extra={
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        jurisprudenceService.reanalyzeJurisprudence(jurisprudence.id)
                          .then(setJurisprudence)
                          .catch(() => message.error('Erro ao reanalisar'))
                      }}
                    >
                      Reanalisar
                    </Button>
                  }
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {jurisprudence.summary && (
                      <div>
                        <Title level={5}>Resumo Executivo</Title>
                        <Paragraph>{jurisprudence.summary}</Paragraph>
                      </div>
                    )}

                    {jurisprudence.key_points && jurisprudence.key_points.length > 0 && (
                      <div>
                        <Title level={5}>Pontos Chave</Title>
                        <List
                          size="small"
                          dataSource={jurisprudence.key_points}
                          renderItem={(item, index) => (
                            <List.Item>
                              <Text>{index + 1}. {item}</Text>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}

                    {jurisprudence.legal_basis && jurisprudence.legal_basis.length > 0 && (
                      <div>
                        <Title level={5}>Fundamentação Legal</Title>
                        <List
                          size="small"
                          dataSource={jurisprudence.legal_basis}
                          renderItem={(item) => <List.Item>{item}</List.Item>}
                        />
                      </div>
                    )}

                    {jurisprudence.arguments && jurisprudence.arguments.length > 0 && (
                      <div>
                        <Title level={5}>Argumentos Estratégicos</Title>
                        <List
                          size="small"
                          dataSource={jurisprudence.arguments}
                          renderItem={(item) => <List.Item>{item}</List.Item>}
                        />
                      </div>
                    )}

                    {jurisprudence.keywords && jurisprudence.keywords.length > 0 && (
                      <div>
                        <Title level={5}>Palavras-chave</Title>
                        <Space wrap>
                          {jurisprudence.keywords.map((keyword, index) => (
                            <Tag key={index}>{keyword}</Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                </Card>
              ) : (
                <Card>
                  <Empty
                    description="Analise uma jurisprudência para ver os resultados aqui"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>

        {/* Comparação */}
        <TabPane tab={<span><SwapOutlined /> Comparar</span>} key="compare">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Primeira Jurisprudência">
                <Form form={compareForm1} layout="vertical">
                  <Form.Item name="title1" label="Título (opcional)">
                    <Input placeholder="Ex: Decisão do STJ" />
                  </Form.Item>
                  <Form.Item
                    name="text1"
                    label="Texto da Decisão"
                    rules={[{ required: true, message: 'Texto é obrigatório' }]}
                  >
                    <TextArea rows={8} placeholder="Cole o texto da primeira decisão..." />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Segunda Jurisprudência">
                <Form form={compareForm2} layout="vertical">
                  <Form.Item name="title2" label="Título (opcional)">
                    <Input placeholder="Ex: Decisão do TJSP" />
                  </Form.Item>
                  <Form.Item
                    name="text2"
                    label="Texto da Decisão"
                    rules={[{ required: true, message: 'Texto é obrigatório' }]}
                  >
                    <TextArea rows={8} placeholder="Cole o texto da segunda decisão..." />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>

          <Row style={{ marginTop: 16 }}>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<SwapOutlined />}
                onClick={handleCompare}
                loading={loading}
              >
                Comparar Jurisprudências
              </Button>
            </Col>
          </Row>

          {compareResult && (
            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card title="Resultado da Comparação">
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{compareResult.comparison}</Paragraph>
                  {compareResult.similarities && compareResult.similarities.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Title level={5}>Semelhanças</Title>
                      <List
                        dataSource={compareResult.similarities}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </div>
                  )}
                  {compareResult.differences && compareResult.differences.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Title level={5}>Diferenças</Title>
                      <List
                        dataSource={compareResult.differences}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          )}
        </TabPane>

        {/* Chat com IA */}
        <TabPane tab={<span><MessageOutlined /> Chat</span>} key="chat">
          <Card
            title="Chat com Assistente Jurídico"
            style={{ height: '600px', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                background: '#f5f5f5'
              }}
            >
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: msg.role === 'user' ? '#1890ff' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : '#000000',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ marginBottom: 4, fontSize: 12, opacity: 0.7 }}>
                      {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      {' '}
                      {msg.role === 'user' ? 'Você' : 'Assistente'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                  <Spin />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <Divider style={{ margin: 0 }} />

            <div style={{ padding: '16px' }}>
              <Form form={chatForm} onFinish={onChatSubmit} layout="inline" style={{ width: '100%' }}>
                <Form.Item
                  name="message"
                  style={{ flex: 1, marginRight: 8 }}
                  rules={[{ required: true, message: 'Digite uma mensagem' }]}
                >
                  <Input
                    placeholder="Digite sua pergunta sobre jurisprudência..."
                    onPressEnter={(e) => {
                      e.preventDefault()
                      chatForm.submit()
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={chatLoading}
                  >
                    Enviar
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

