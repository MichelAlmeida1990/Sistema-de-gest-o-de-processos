import React, { useState } from 'react'
import { 
  Modal, 
  Input, 
  Button, 
  Typography, 
  Space,
  Alert,
  message 
} from 'antd'
import { SafetyOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface TwoFactorLoginProps {
  visible: boolean
  email: string
  password: string
  onSuccess: (token: string, user: any) => void
  onCancel: () => void
}

export const TwoFactorLogin: React.FC<TwoFactorLoginProps> = ({
  visible,
  email,
  password,
  onSuccess,
  onCancel
}) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      message.error('Digite um código de 6 dígitos')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          totp_code: code 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Código inválido')
      }

      const data = await response.json()
      
      message.success('Login realizado com sucesso!')
      onSuccess(data.access_token, data.user)
      
    } catch (error: any) {
      console.error('Erro na verificação 2FA:', error)
      message.error(error.message || 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCode('')
    onCancel()
  }

  return (
    <Modal
      title="Autenticação de Dois Fatores"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnClose
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <SafetyOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        
        <Title level={4}>Verificação de Segurança</Title>
        
        <Text>
          Digite o código de 6 dígitos do seu aplicativo autenticador:
        </Text>
        
        <Space direction="vertical" style={{ width: '100%', marginTop: 20 }}>
          <Input
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{ 
              textAlign: 'center', 
              fontSize: '24px', 
              letterSpacing: '8px',
              height: '50px'
            }}
            maxLength={6}
            autoFocus
            onPressEnter={handleVerify}
          />
          
          <Alert
            message="Use seu aplicativo autenticador"
            description="Abra o Google Authenticator, Authy ou outro aplicativo 2FA e digite o código de 6 dígitos."
            type="info"
            showIcon
            style={{ textAlign: 'left' }}
          />
          
          <Space style={{ marginTop: 20 }}>
            <Button onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              type="primary" 
              onClick={handleVerify}
              loading={loading}
              disabled={code.length !== 6}
            >
              Verificar
            </Button>
          </Space>
        </Space>
      </div>
    </Modal>
  )
}
