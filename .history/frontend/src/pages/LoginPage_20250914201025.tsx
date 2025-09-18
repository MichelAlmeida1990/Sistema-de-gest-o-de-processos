import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, SafetyOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'

const { Title, Text, Paragraph } = Typography

interface LoginForm {
  email: string
  password: string
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const { login, isLoading } = useAuth()

  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    
    try {
      await login({
        email: values.email,
        password: values.password,
        totp_code: showTwoFactor ? twoFactorCode : undefined
      })
    } catch (error) {
      // Se for erro de 2FA, mostrar campo de código
      if (error.message?.includes('2FA')) {
        setShowTwoFactor(true)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorLogin = async () => {
    setLoading(true)
    
    try {
      await login({
        email: '',
        password: '',
        totp_code: twoFactorCode
      })
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
          `,
          zIndex: 1
        }}
      />

      <div 
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Card 
          style={{
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div 
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 10px 20px rgba(3, 31, 95, 0.3)'
              }}
            >
              <DatabaseOutlined style={{ fontSize: '32px', color: 'white' }} />
            </div>
            
            <Title level={2} style={{ margin: 0, color: '#031f5f', fontWeight: 700 }}>
              Sistema de Gestão
            </Title>
            <Title level={4} style={{ margin: '8px 0 0', color: '#00afee', fontWeight: 500 }}>
              de Processos e Cálculos
            </Title>
            
            <Paragraph style={{ margin: '16px 0 0', color: '#666', fontSize: '14px' }}>
              Acesse sua conta para gerenciar processos e cálculos
            </Paragraph>
          </div>

          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Por favor, insira seu usuário!' }]}
              style={{ marginBottom: '20px' }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#031f5f' }} />}
                placeholder="Digite seu usuário"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                  padding: '12px 16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#031f5f'
                  e.target.style.boxShadow = '0 0 0 2px rgba(3, 31, 95, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e8e8'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              style={{ marginBottom: '24px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#031f5f' }} />}
                placeholder="Digite sua senha"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                  padding: '12px 16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#031f5f'
                  e.target.style.boxShadow = '0 0 0 2px rgba(3, 31, 95, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e8e8'
                  e.target.style.boxShadow = 'none'
                }}
                iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#031f5f" /> : <EyeInvisibleOutlined style={{ color: '#999' }} />)}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '24px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '52px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 8px 20px rgba(3, 31, 95, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(3, 31, 95, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(3, 31, 95, 0.3)'
                }}
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '24px 0' }}>
            <Space>
              <SafetyOutlined style={{ color: '#52c41a' }} />
              <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                Ambiente Seguro
              </Text>
            </Space>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#999', fontSize: '12px' }}>
              <strong>Modo Desenvolvimento:</strong> Use qualquer usuário/senha para testar
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}