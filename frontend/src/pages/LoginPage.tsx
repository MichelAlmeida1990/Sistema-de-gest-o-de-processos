import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { TwoFactorLogin } from '../components/TwoFactorLogin'
import { isMobile } from '../utils/mobile'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [loginCredentials, setLoginCredentials] = useState<LoginForm | null>(null)
  const { login, loginWithToken } = useAuth()
  const navigate = useNavigate()

  // Login automático para mobile
  useEffect(() => {
    if (isMobile()) {
      handleMobileLogin()
    }
  }, [])

  const handleMobileLogin = async () => {
    setLoading(true)
    try {
      // Login automático com usuário padrão para mobile
      const mobileCredentials = {
        email: 'admin@sistema.com',
        password: 'qualquer_senha'
      }
      
      // Usar configuração dinâmica da API
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.16:8000/api/v1'
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(mobileCredentials),
      })

      if (response.ok) {
        const data = await response.json()
        await loginWithToken(data.access_token, data.user)
        navigate('/dashboard')
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
        message.error(`Erro no login: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Erro no login automático:', error)
      message.error('Erro de conexão - verifique a rede')
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (values: LoginForm) => {
    console.log('LOGIN: Tentando fazer login com:', values.email)
    
    setLoading(true)
    
    try {
      // Tentar login inicial
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.status === 202) {
        // 2FA necessário
        setLoginCredentials(values)
        setShow2FA(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao fazer login')
      }

      const data = await response.json()
      
      console.log('🎉 Login realizado com sucesso!')
      console.log('🔑 Token recebido:', data.access_token ? 'SIM' : 'NÃO')
      console.log('👤 Usuário recebido:', data.user ? 'SIM' : 'NÃO')
      
      // Login direto (sem 2FA)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      console.log('💾 Token salvo no localStorage:', localStorage.getItem('token') ? 'SIM' : 'NÃO')
      console.log('💾 Usuário salvo no localStorage:', localStorage.getItem('user') ? 'SIM' : 'NÃO')
      
      message.success('Login realizado com sucesso!')
      
      console.log('🔄 Navegando para dashboard...')
      navigate('/dashboard')
      
      console.log('🔄 Recarregando página...')
      window.location.reload() // Recarregar para atualizar o contexto
      
    } catch (error: any) {
      console.error('LOGIN: Erro no login:', error)
      message.error(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASuccess = (token: string, user: any) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    setShow2FA(false)
    setLoginCredentials(null)
    navigate('/dashboard')
    window.location.reload()
  }

  const handle2FACancel = () => {
    setShow2FA(false)
    setLoginCredentials(null)
  }

  // Se for mobile, mostrar loading ou formulário de fallback
  if (isMobile()) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
             background: 'linear-gradient(135deg, rgba(25, 25, 112, 0.9) 0%, rgba(3, 31, 95, 0.85) 100%)',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Sistema de Gestão
          </Title>
          <Text type="secondary" style={{ marginBottom: 32 }}>
            {loading ? 'Login automático em andamento...' : 'Login automático falhou - use o formulário abaixo'}
          </Text>
          
          {loading ? (
            <Button type="primary" loading={true} size="large" block>
              Conectando...
            </Button>
          ) : (
            <Form
              name="mobile-login"
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
                rules={[{ required: true, message: 'Por favor, digite sua senha!' }]}
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
                  size="large" 
                  block
                  style={{
                    color: '#1a1a1a',
                    fontWeight: '600'
                  }}
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
             background: 'linear-gradient(135deg, rgba(25, 25, 112, 0.9) 0%, rgba(3, 31, 95, 0.85) 100%)',
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
                fontSize: 16,
                color: '#1a1a1a',
                fontWeight: '600'
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

      {/* Modal de 2FA */}
      {show2FA && loginCredentials && (
        <TwoFactorLogin
          visible={show2FA}
          email={loginCredentials.email}
          password={loginCredentials.password}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      )}
    </div>
  )
}