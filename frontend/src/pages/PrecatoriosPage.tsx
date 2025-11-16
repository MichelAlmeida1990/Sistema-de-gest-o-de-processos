import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { CalculatorOutlined } from '@ant-design/icons'

import { precatorioService, Precatorio, PrecatorioCreateRequest, PrecatorioUpdateRequest } from '../services/precatorioService'
import indicesEconomicosService, { IndiceEconomico } from '../services/indicesEconomicosService'

const { Title } = Typography
const { Option } = Select

export const PrecatoriosPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Precatorio[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<Precatorio | null>(null)
  const [form] = Form.useForm()
  const [calculando, setCalculando] = useState<number | null>(null)
  const [indicesDisponiveis, setIndicesDisponiveis] = useState<IndiceEconomico[]>([])
  const [modalCalculo, setModalCalculo] = useState(false)
  const [resultadoCalculo, setResultadoCalculo] = useState<any>(null)

  const loadData = async (currentPage = page, currentPageSize = pageSize) => {
    setLoading(true)
    try {
      const res = await precatorioService.list({ page: currentPage, per_page: currentPageSize })
      setData(res.items)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    loadIndices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const loadIndices = async () => {
    try {
      const indices = await indicesEconomicosService.getIndicesDisponiveis()
      setIndicesDisponiveis(indices)
    } catch (error) {
      console.error('Erro ao carregar índices:', error)
    }
  }

  const calcularAtualizacao = async (precatorio: Precatorio, indice: string = 'IPCA_E') => {
    if (!precatorio.data_inscricao) {
      message.error('Precatório precisa ter data de inscrição para calcular atualização')
      return
    }

    setCalculando(precatorio.id)
    try {
      const resultado = await indicesEconomicosService.calcularAtualizacaoPrecatorio(
        precatorio.id,
        indice,
        undefined // Usa data atual
      )
      
      setResultadoCalculo(resultado)
      setModalCalculo(true)
      await loadData() // Recarrega para mostrar valor atualizado
      message.success('Atualização calculada com sucesso!')
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Erro ao calcular atualização')
    } finally {
      setCalculando(null)
    }
  }

  const openCreateModal = () => {
    setEditing(null)
    form.resetFields()
    setModalVisible(true)
  }

  const openEditModal = (record: Precatorio) => {
    setEditing(record)
    form.setFieldsValue({
      numero: record.numero,
      ente_devedor: record.ente_devedor,
      cliente_nome: record.cliente_nome,
      valor_origem: Number(record.valor_origem),
      valor_atualizado: record.valor_atualizado ? Number(record.valor_atualizado) : undefined,
      status: record.status,
      natureza: record.natureza,
      ano_orcamento: record.ano_orcamento,
      data_inscricao: record.data_inscricao ? dayjs(record.data_inscricao) : undefined,
      observacoes: record.observacoes,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload: PrecatorioCreateRequest | PrecatorioUpdateRequest = {
      ...values,
      data_inscricao: values.data_inscricao ? values.data_inscricao.toISOString() : undefined,
    }

    setLoading(true)
    try {
      if (editing) {
        await precatorioService.update(editing.id, payload as PrecatorioUpdateRequest)
      } else {
        await precatorioService.create(payload as PrecatorioCreateRequest)
      }
      setModalVisible(false)
      loadData()
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnsType<Precatorio> = [
    {
      title: 'Número',
      dataIndex: 'numero',
      key: 'numero',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nome',
      key: 'cliente_nome',
    },
    {
      title: 'Ente Devedor',
      dataIndex: 'ente_devedor',
      key: 'ente_devedor',
    },
    {
      title: 'Natureza',
      dataIndex: 'natureza',
      key: 'natureza',
      render: (value: string) => (
        <Tag color={value === 'alimentar' ? 'green' : 'blue'}>
          {value === 'alimentar' ? 'Alimentar' : 'Comum'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Valor Origem',
      dataIndex: 'valor_origem',
      key: 'valor_origem',
      render: (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
      title: 'Valor Atualizado',
      dataIndex: 'valor_atualizado',
      key: 'valor_atualizado',
      render: (v?: number) =>
        v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          {record.data_inscricao && record.valor_origem && (
            <Popconfirm
              title="Calcular atualização?"
              description={`Calcular atualização usando IPCA-E para o precatório ${record.numero}?`}
              onConfirm={() => calcularAtualizacao(record)}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                size="small"
                icon={<CalculatorOutlined />}
                loading={calculando === record.id}
                type="primary"
              >
                Atualizar
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card
        title={<Title level={3}>Precatórios</Title>}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            Novo Precatório
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
        />
      </Card>

      <Modal
        open={modalVisible}
        title={editing ? 'Editar Precatório' : 'Novo Precatório'}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="numero"
            label="Número do Precatório"
            rules={[{ required: true, message: 'Informe o número' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="cliente_nome"
            label="Nome do Cliente"
            rules={[{ required: true, message: 'Informe o cliente' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ente_devedor"
            label="Ente Devedor"
            rules={[{ required: true, message: 'Informe o ente devedor' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="valor_origem"
            label="Valor de Origem"
            rules={[{ required: true, message: 'Informe o valor de origem' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="valor_atualizado" label="Valor Atualizado">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="natureza" label="Natureza">
            <Select allowClear>
              <Option value="alimentar">Alimentar</Option>
              <Option value="comum">Comum</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select allowClear>
              <Option value="aguardando_inscricao">Aguardando inscrição</Option>
              <Option value="inscrito_orcamento">Inscrito em orçamento</Option>
              <Option value="aguardando_pagamento">Aguardando pagamento</Option>
              <Option value="pago_parcial">Pago parcial</Option>
              <Option value="pago">Pago</Option>
              <Option value="negociado">Negociado</Option>
            </Select>
          </Form.Item>

          <Form.Item name="ano_orcamento" label="Ano do Orçamento">
            <InputNumber style={{ width: '100%' }} min={2000} max={2100} />
          </Form.Item>

          <Form.Item name="data_inscricao" label="Data de Inscrição">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="observacoes" label="Observações">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={modalCalculo}
        title="Resultado do Cálculo de Atualização"
        onCancel={() => setModalCalculo(false)}
        footer={[
          <Button key="close" onClick={() => setModalCalculo(false)}>
            Fechar
          </Button>,
        ]}
        width={600}
      >
        {resultadoCalculo?.calculo && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card size="small">
                <Typography.Text strong>Índice usado: </Typography.Text>
                <Tag color="blue">{resultadoCalculo.calculo.indice_usado}</Tag>
              </Card>
              
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Typography.Text>Valor de origem: </Typography.Text>
                    <Typography.Text strong>
                      {Number(resultadoCalculo.calculo.valor_origem).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text>Valor atualizado: </Typography.Text>
                    <Typography.Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                      {Number(resultadoCalculo.calculo.valor_atualizado).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text>Variação: </Typography.Text>
                    <Tag color={resultadoCalculo.calculo.variacao_percentual >= 0 ? 'green' : 'red'}>
                      {resultadoCalculo.calculo.variacao_percentual >= 0 ? '+' : ''}
                      {resultadoCalculo.calculo.variacao_percentual.toFixed(2)}%
                    </Tag>
                  </div>
                </Space>
              </Card>

              <Card size="small" title="Detalhes">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Typography.Text type="secondary">Data base: </Typography.Text>
                    <Typography.Text>{resultadoCalculo.calculo.data_base}</Typography.Text>
                  </div>
                  <div>
                    <Typography.Text type="secondary">Data atualização: </Typography.Text>
                    <Typography.Text>{resultadoCalculo.calculo.data_atualizacao}</Typography.Text>
                  </div>
                  <div>
                    <Typography.Text type="secondary">Fator de atualização: </Typography.Text>
                    <Typography.Text>{resultadoCalculo.calculo.fator_atualizacao.toFixed(6)}</Typography.Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </div>
        )}
      </Modal>
    </>
  )
}


