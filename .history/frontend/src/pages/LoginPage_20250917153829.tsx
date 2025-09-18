import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: LoginForm) => {
    console.log('LOGIN: Tentando fazer login com:', values.email)
    
    setLoading(true)
    
    try {
      const success = await login(values.email, values.password)
      
      if (success) {
        console.log('LOGIN: Login realizado com sucesso, redirecionando...')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('LOGIN: Erro no login:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Sistema de Gestão
          </Title>
          <Text type="secondary">
            Acesse sua conta para continuar
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, digite seu email!' },
              { type: 'email', message: 'Digite um email válido!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Digite seu email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor, digite sua senha!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Digite sua senha" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                width: '100%',
                height: 45,
                fontSize: 16
              }}
            >
              Entrar no Sistema
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ambiente Seguro ✓
          </Text>
        </div>
      </Card>
    </div>
  )
}