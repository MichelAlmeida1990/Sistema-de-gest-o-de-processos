import React, { useState, useRef } from 'react'
import { 
  Row, Col, Card, Button, Input, Select, Typography, Modal, Form, message, 
  Tag, Avatar, Space, Timeline, Badge, Divider, Tooltip, DatePicker, Upload,
  Table, Progress, Image, Tabs, List, Empty
} from 'antd'
import {
  PlusOutlined, SearchOutlined, FilterOutlined, EditOutlined, 
  UserOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
  MessageOutlined, PaperClipOutlined, EyeOutlined, DownloadOutlined,
  UploadOutlined, FolderOutlined, FileOutlined, DeleteOutlined,
  InboxOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined,
  FileExcelOutlined, FileZipOutlined, FilePptOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { createDeliveryEvent } from '../store/timelineStore'
import { useAuthStore } from '../store/authStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { Dragger } = Upload
const { TabPane } = Tabs

interface FileItem {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  uploader: string
  processNumber?: string
  category: string
  description?: string
  tags: string[]
  url?: string
  thumbnail?: string
}

interface Process {
  id: string
  number: string
  title: string
  status: string
  client: string
}

export const FileManagerPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingFile, setEditingFile] = useState<FileItem | null>(null)
  const [form] = Form.useForm()
  
  // Usar o store de autenticação para obter o usuário atual
  const { user } = useAuthStore()

  // Estado para os arquivos
  const [filesData, setFilesData] = useState<FileItem[]>([
    {
      id: '1',
      name: 'contrato_trabalhista.pdf',
      type: 'pdf',
      size: 2048576, // 2MB
      uploadDate: '2024-01-20T10:30:00',
      uploader: 'Ana Santos',
      processNumber: '1001234-56.2024.8.26.0001',
      category: 'Contrato',
      description: 'Contrato de trabalho do cliente João Silva',
      tags: ['Contrato', 'Trabalhista'],
      url: '/files/contrato_trabalhista.pdf'
    },
    {
      id: '2',
      name: 'holerites_2023.xlsx',
      type: 'excel',
      size: 512000, // 512KB
      uploadDate: '2024-01-19T14:20:00',
      uploader: 'Carlos Lima',
      processNumber: '1001234-56.2024.8.26.0001',
      category: 'Documentação',
      description: 'Holerites dos últimos 12 meses',
      tags: ['Salário', 'Documentação'],
      url: '/files/holerites_2023.xlsx'
    },
    {
      id: '3',
      name: 'foto_documentos.jpg',
      type: 'image',
      size: 1024000, // 1MB
      uploadDate: '2024-01-18T16:45:00',
      uploader: 'Maria Costa',
      processNumber: '2001234-56.2024.8.26.0002',
      category: 'Identificação',
      description: 'Foto dos documentos de identificação',
      tags: ['RG', 'CPF'],
      url: '/files/foto_documentos.jpg',
      thumbnail: '/files/thumbnails/foto_documentos.jpg'
    }
  ])

  // Dados mockados dos processos
  const processes: Process[] = [
    {
      id: '1',
      number: '1001234-56.2024.8.26.0001',
      title: 'Ação Trabalhista - Rescisão',
      status: 'Em Andamento',
      client: 'João Silva'
    },
    {
      id: '2',
      number: '2001234-56.2024.8.26.0002',
      title: 'Processo Criminal - Furto',
      status: 'Concluído',
      client: 'Maria Santos'
    }
  ]

  const getFileIcon = (type: string) => {
    const iconProps = { style: { fontSize: '24px' } }
    
    switch (type) {
      case 'pdf': return <FilePdfOutlined {...iconProps} style={{ color: '#ff4d4f' }} />
      case 'image': return <FileImageOutlined {...iconProps} style={{ color: '#52c41a' }} />
      case 'word': return <FileWordOutlined {...iconProps} style={{ color: '#1890ff' }} />
      case 'excel': return <FileExcelOutlined {...iconProps} style={{ color: '#52c41a' }} />
      case 'zip': return <FileZipOutlined {...iconProps} style={{ color: '#faad14' }} />
      case 'ppt': return <FilePptOutlined {...iconProps} style={{ color: '#722ed1' }} />
      default: return <FileOutlined {...iconProps} style={{ color: '#666' }} />
    }
  }

  const getFileTypeText = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF'
      case 'image': return 'Imagem'
      case 'word': return 'Word'
      case 'excel': return 'Excel'
      case 'zip': return 'Arquivo'
      case 'ppt': return 'PowerPoint'
      default: return type.toUpperCase()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = filesData.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                         file.uploader.toLowerCase().includes(searchText.toLowerCase()) ||
                         (file.processNumber && file.processNumber.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchesProcess = selectedProcess === 'all' || file.processNumber === selectedProcess
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter
    const matchesType = typeFilter === 'all' || file.type === typeFilter
    
    return matchesSearch && matchesProcess && matchesCategory && matchesType
  })

  const handleUpload = async (file: any) => {
    setLoading(true)
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || 'file',
      size: file.size,
      uploadDate: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      uploader: user?.name || 'Usuário',
      processNumber: selectedProcess !== 'all' ? selectedProcess : undefined,
      category: 'Geral',
      description: '',
      tags: [],
      url: `/files/${file.name}`
    }
    
    setFilesData(prevFiles => [newFile, ...prevFiles])
    
    // Criar evento na timeline
    createDeliveryEvent(
      'uploaded',
      newFile.processNumber || 'Geral',
      user?.name || 'Usuário',
      {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: getFileTypeText(newFile.type)
      }
    )
    
    message.success(`${file.name} enviado com sucesso!`)
    setLoading(false)
    return false // Previne upload real
  }

  const handleEditFile = (file: FileItem) => {
    setEditingFile(file)
    form.setFieldsValue({
      ...file,
      uploadDate: dayjs(file.uploadDate)
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingFile) {
        // Atualizar arquivo existente
        setFilesData(prevFiles => 
          prevFiles.map(file => 
            file.id === editingFile.id 
              ? {
                  ...file,
                  ...values,
                  uploadDate: values.uploadDate ? values.uploadDate.format('YYYY-MM-DDTHH:mm:ss') : file.uploadDate,
                  id: file.id
                }
              : file
          )
        )
        message.success('Arquivo atualizado com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      setEditingFile(null)
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error)
      message.error('Erro ao salvar arquivo')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = (fileId: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este arquivo?',
      okText: 'Excluir',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: () => {
        setFilesData(prevFiles => prevFiles.filter(file => file.id !== fileId))
        message.success('Arquivo excluído com sucesso!')
      }
    })
  }

  const FileGridCard = ({ file }: { file: FileItem }) => (
    <Card
      hoverable
      style={{
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        transition: 'all 0.2s'
      }}
      bodyStyle={{ padding: '16px' }}
      actions={[
        <Tooltip title="Visualizar">
          <EyeOutlined onClick={() => window.open(file.url, '_blank')} />
        </Tooltip>,
        <Tooltip title="Baixar">
          <DownloadOutlined onClick={() => message.info('Download em desenvolvimento')} />
        </Tooltip>,
        <Tooltip title="Editar">
          <EditOutlined onClick={() => handleEditFile(file)} />
        </Tooltip>,
        <Tooltip title="Excluir">
          <DeleteOutlined onClick={() => handleDeleteFile(file.id)} />
        </Tooltip>
      ]}
    >
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        {getFileIcon(file.type)}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
          {file.name}
        </Text>
        <Text style={{ fontSize: '12px', color: '#666' }}>
          {formatFileSize(file.size)}
        </Text>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <Tag color="blue" size="small">{getFileTypeText(file.type)}</Tag>
        <Tag color="green" size="small">{file.category}</Tag>
      </div>
      
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
        <div>Por: {file.uploader}</div>
        <div>{dayjs(file.uploadDate).format('DD/MM/YYYY')}</div>
      </div>
      
      {file.processNumber && (
        <div style={{ fontSize: '11px', color: '#666' }}>
          {file.processNumber}
        </div>
      )}
    </Card>
  )

  const columns = [
    {
      title: 'Arquivo',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string, record: FileItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {getFileIcon(record.type)}
          <div>
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
            <div style={{ marginTop: '4px' }}>
              {record.tags.map(tag => (
                <Tag key={tag} size="small" style={{ margin: '1px' }}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Tamanho',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size)
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="green">{category}</Tag>
      )
    },
    {
      title: 'Processo',
      dataIndex: 'processNumber',
      key: 'processNumber',
      width: 200,
      render: (processNumber: string) => processNumber || '-'
    },
    {
      title: 'Uploader',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 120,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={20} icon={<UserOutlined />} />
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </div>
      )
    },
    {
      title: 'Data',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record: FileItem) => (
        <Space size="small">
          <Tooltip title="Visualizar">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => window.open(record.url, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Baixar">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => message.info('Download em desenvolvimento')}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditFile(record)}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small"
              danger
              onClick={() => handleDeleteFile(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Gerenciador de Arquivos
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Organize e gerencie todos os documentos dos processos
        </Text>
      </div>

      {/* Upload Area */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none',
          marginBottom: '24px'
        }}
      >
        <Dragger
          name="file"
          multiple
          beforeUpload={handleUpload}
          showUploadList={false}
          loading={loading}
          style={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            border: '2px dashed #031f5f'
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: '48px', color: '#031f5f' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: '18px', color: '#031f5f', fontWeight: 600 }}>
            Clique ou arraste arquivos aqui para fazer upload
          </p>
          <p className="ant-upload-hint" style={{ color: '#666' }}>
            Suporte para PDF, imagens, documentos Word, Excel e outros formatos
          </p>
        </Dragger>
      </Card>

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
              placeholder="Buscar arquivos..."
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
              placeholder="Categoria"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todas</Option>
              <Option value="Contrato">Contrato</Option>
              <Option value="Documentação">Documentação</Option>
              <Option value="Identificação">Identificação</Option>
              <Option value="Geral">Geral</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Tipo"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              <Option value="pdf">PDF</Option>
              <Option value="image">Imagem</Option>
              <Option value="word">Word</Option>
              <Option value="excel">Excel</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Button.Group>
              <Button 
                icon={<FolderOutlined />} 
                onClick={() => setViewMode('grid')}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                style={{ borderRadius: '12px 0 0 12px' }}
              />
              <Button 
                icon={<FileOutlined />} 
                onClick={() => setViewMode('list')}
                type={viewMode === 'list' ? 'primary' : 'default'}
                style={{ borderRadius: '0 12px 12px 0' }}
              />
            </Button.Group>
          </Col>
        </Row>
      </Card>

      {/* Files Display */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Arquivos</span>
            <Badge count={filteredFiles.length} style={{ backgroundColor: '#031f5f' }} />
          </div>
        }
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {filteredFiles.length === 0 ? (
          <Empty 
            description="Nenhum arquivo encontrado"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : viewMode === 'grid' ? (
          <Row gutter={[16, 16]}>
            {filteredFiles.map(file => (
              <Col xs={24} sm={12} md={8} lg={6} key={file.id}>
                <FileGridCard file={file} />
              </Col>
            ))}
          </Row>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredFiles}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredFiles.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} arquivos`,
              style: { marginTop: '16px' }
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        )}
      </Card>

      {/* Modal para editar arquivo */}
      <Modal
        title="Editar Arquivo"
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
            label="Nome do Arquivo"
            name="name"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: contrato_trabalhista.pdf" />
          </Form.Item>
          
          <Form.Item
            label="Descrição"
            name="description"
          >
            <TextArea rows={3} placeholder="Descreva o conteúdo do arquivo..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Processo Relacionado"
                name="processNumber"
              >
                <Select placeholder="Selecione o processo" allowClear>
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
                label="Categoria"
                name="category"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione a categoria">
                  <Option value="Contrato">Contrato</Option>
                  <Option value="Documentação">Documentação</Option>
                  <Option value="Identificação">Identificação</Option>
                  <Option value="Geral">Geral</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Tags"
            name="tags"
          >
            <Select mode="tags" placeholder="Adicione tags">
              <Option value="Contrato">Contrato</Option>
              <Option value="Trabalhista">Trabalhista</Option>
              <Option value="Salário">Salário</Option>
              <Option value="Documentação">Documentação</Option>
              <Option value="RG">RG</Option>
              <Option value="CPF">CPF</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

