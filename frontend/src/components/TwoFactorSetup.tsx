import React, { useState } from 'react'
import { 
  Modal, 
  Steps, 
  Button, 
  Input, 
  Typography, 
  Alert, 
  QRCode, 
  Space,
  Card,
  message 
} from 'antd'
import { 
  SafetyOutlined, 
  QrcodeOutlined, 
  KeyOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface TwoFactorSetupProps {
  visible: boolean
  onCancel: () => void
  onComplete: () => void
}

interface SetupData {
  secret: string
  qr_code: string
  backup_codes: string[]
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  visible,
  onCancel,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')

  const handleStartSetup = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/v1/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao configurar 2FA')
      }

      const data = await response.json()
      setSetupData(data)
      setCurrentStep(1)
      
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error)
      message.error('Erro ao configurar autenticação de dois fatores')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error('Digite um código de 6 dígitos')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/v1/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode })
      })

      if (!response.ok) {
        throw new Error('Código inválido')
      }

      message.success('2FA configurado com sucesso!')
      setCurrentStep(2)
      
    } catch (error) {
      console.error('Erro ao verificar código:', error)
      message.error('Código inválido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    onComplete()
    setCurrentStep(0)
    setSetupData(null)
    setVerificationCode('')
  }

  const steps = [
    {
      title: 'Início',
      icon: <SafetyOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <SafetyOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={3}>Configurar Autenticação de Dois Fatores</Title>
          <Paragraph>
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
            Você precisará de um aplicativo autenticador como Google Authenticator ou Authy.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleStartSetup}
            loading={loading}
          >
            Começar Configuração
          </Button>
        </div>
      )
    },
    {
      title: 'QR Code',
      icon: <QrcodeOutlined />,
      content: setupData && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={3}>Escaneie o QR Code</Title>
          <Paragraph>
            Use seu aplicativo autenticador para escanear o código QR abaixo:
          </Paragraph>
          
          <Card style={{ margin: '20px 0', display: 'inline-block' }}>
            <QRCode 
              value={setupData.qr_code} 
              size={200}
              style={{ margin: '20px' }}
            />
          </Card>
          
          <Paragraph>
            <Text strong>Chave manual:</Text><br />
            <Text code copyable>{setupData.secret}</Text>
          </Paragraph>
          
          <Alert
            message="Códigos de Backup"
            description={
              <div>
                <Paragraph>Guarde estes códigos em local seguro. Você pode usá-los se perder acesso ao seu dispositivo:</Paragraph>
                <div style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {setupData.backup_codes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
              </div>
            }
            type="warning"
            style={{ textAlign: 'left', margin: '20px 0' }}
          />
          
          <Space direction="vertical" style={{ width: '100%', marginTop: 20 }}>
            <Text>Digite o código de 6 dígitos do seu aplicativo:</Text>
            <Input
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
              maxLength={6}
            />
            <Button 
              type="primary" 
              onClick={handleVerifyCode}
              loading={loading}
              disabled={verificationCode.length !== 6}
            >
              Verificar Código
            </Button>
          </Space>
        </div>
      )
    },
    {
      title: 'Concluído',
      icon: <CheckCircleOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={3}>2FA Configurado com Sucesso!</Title>
          <Paragraph>
            Sua conta agora está protegida com autenticação de dois fatores.
            A partir do próximo login, você precisará informar o código do seu aplicativo.
          </Paragraph>
          <Alert
            message="Importante"
            description="Guarde seus códigos de backup em local seguro. Eles são sua única forma de recuperar acesso se perder seu dispositivo."
            type="info"
            style={{ margin: '20px 0', textAlign: 'left' }}
          />
          <Button 
            type="primary" 
            size="large" 
            onClick={handleComplete}
          >
            Finalizar
          </Button>
        </div>
      )
    }
  ]

  return (
    <Modal
      title="Configurar Autenticação de Dois Fatores"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(step => (
          <Steps.Step 
            key={step.title}
            title={step.title} 
            icon={step.icon} 
          />
        ))}
      </Steps>
      
      <div style={{ minHeight: '400px' }}>
        {steps[currentStep].content}
      </div>
    </Modal>
  )
}
