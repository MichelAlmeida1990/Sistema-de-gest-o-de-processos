import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Divider,
  Tag,
  Statistic
} from 'antd'
import {
  CalculatorOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { deadlineService } from '../services/deadlineService'

const { Title, Text } = Typography
const { Option } = Select

interface DeadlineResult {
  success: boolean
  data_inicial: string
  data_final: string
  numero_dias: number
  tipo_prazo: string
  tribunal?: string
  dias_totais: number
  dias_uteis: number
  feriados_considerados: boolean
  suspensoes_consideradas: boolean
  timestamp: string
}

export const DeadlineCalculatorPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DeadlineResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onFinish = async (values: any) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const dataInicial = values.data_inicial.format('YYYY-MM-DDTHH:mm:ss')

      const response = await deadlineService.calculateDeadline({
        data_inicial: dataInicial,
        numero_dias: values.numero_dias,
        tipo_prazo: values.tipo_prazo || 'dias_uteis',
        tribunal: values.tribunal || null,
        incluir_feriados: values.incluir_feriados !== false,
        incluir_suspensoes: values.incluir_suspensoes !== false
      })

      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao calcular prazo')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY [às] HH:mm')
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CalculatorOutlined /> Calculadora de Prazos Processuais
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card>
            <Title level={4}>Nova Simulação</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                tipo_prazo: 'dias_uteis',
                incluir_feriados: true,
                incluir_suspensoes: true
              }}
            >
              <Form.Item
                label="Data Inicial"
                name="data_inicial"
                rules={[
                  { required: true, message: 'Selecione a data inicial' }
                ]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Selecione a data"
                />
              </Form.Item>

              <Form.Item
                label="Tipo de Prazo"
                name="tipo_prazo"
                rules={[
                  { required: true, message: 'Selecione o tipo de prazo' }
                ]}
              >
                <Select placeholder="Cível, Penal, Trabalhista, etc.">
                  <Option value="dias_uteis">Dias Úteis</Option>
                  <Option value="dias_corridos">Dias Corridos</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Tribunal (Opcional)"
                name="tribunal"
              >
                <Select
                  placeholder="Selecione o tribunal"
                  allowClear
                >
                  <Option value="TJSP">TJSP - Tribunal de Justiça de São Paulo</Option>
                  <Option value="TRF2">TRF2 - Tribunal Regional Federal da 2ª Região</Option>
                  <Option value="TRT2">TRT2 - Tribunal Regional do Trabalho da 2ª Região</Option>
                  <Option value="STJ">STJ - Superior Tribunal de Justiça</Option>
                  <Option value="STF">STF - Supremo Tribunal Federal</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Número de Dias"
                name="numero_dias"
                rules={[
                  { required: true, message: 'Informe o número de dias' },
                  { type: 'number', min: 1, message: 'Número de dias deve ser maior que zero' }
                ]}
              >
                <Input
                  type="number"
                  placeholder="Úteis ou corridos"
                  min={1}
                />
              </Form.Item>

              <Form.Item
                label="Feriados e Suspensões"
                name="incluir_feriados"
                valuePropName="checked"
              >
                <Select>
                  <Option value={true}>Incluir calendários</Option>
                  <Option value={false}>Não incluir</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="incluir_suspensoes"
                valuePropName="checked"
                style={{ marginTop: -16 }}
              >
                <Select>
                  <Option value={true}>Considerar suspensões judiciárias</Option>
                  <Option value={false}>Não considerar</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<CalculatorOutlined />}
                  size="large"
                  block
                >
                  CALCULAR PRAZO
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {error && (
            <Alert
              message="Erro"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {result && (
            <Card>
              <Title level={4}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> Resultado do Cálculo
              </Title>

              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Data Inicial:</Text>
                  <br />
                  <Text strong>{formatDate(result.data_inicial)}</Text>
                </div>

                <Divider />

                <div>
                  <Text type="secondary">Data Final:</Text>
                  <br />
                  <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                    {formatDate(result.data_final)}
                  </Title>
                </div>

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Dias Totais"
                      value={result.dias_totais}
                      suffix="dias"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Dias Úteis"
                      value={result.dias_uteis}
                      suffix="dias"
                    />
                  </Col>
                </Row>

                <Divider />

                <div>
                  <Text type="secondary">Configurações:</Text>
                  <br />
                  <Space wrap style={{ marginTop: 8 }}>
                    <Tag color="blue">
                      {result.tipo_prazo === 'dias_uteis' ? 'Dias Úteis' : 'Dias Corridos'}
                    </Tag>
                    {result.feriados_considerados && (
                      <Tag color="green">Feriados Considerados</Tag>
                    )}
                    {result.suspensoes_consideradas && (
                      <Tag color="orange">Suspensões Consideradas</Tag>
                    )}
                    {result.tribunal && (
                      <Tag color="purple">{result.tribunal}</Tag>
                    )}
                  </Space>
                </div>

                <Alert
                  message="Informação"
                  description={
                    <div>
                      <Text>
                        O prazo foi calculado considerando{' '}
                        <Text strong>{result.numero_dias}</Text> dias{' '}
                        {result.tipo_prazo === 'dias_uteis' ? 'úteis' : 'corridos'}.
                      </Text>
                      {result.feriados_considerados && (
                        <div style={{ marginTop: 8 }}>
                          <InfoCircleOutlined /> Feriados nacionais foram considerados no cálculo.
                        </div>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                />
              </Space>
            </Card>
          )}

          {!result && !error && (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    Preencha o formulário ao lado para calcular o prazo processual
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}



