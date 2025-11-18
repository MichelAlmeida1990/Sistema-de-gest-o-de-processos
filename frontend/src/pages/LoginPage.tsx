import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined, CopyOutlined, LoginOutlined } from '@ant-design/icons'
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
  const [copying, setCopying] = useState(false)
  const [form] = Form.useForm()
  const [mobileForm] = Form.useForm()
  const { login, loginWithToken } = useAuth()
  const navigate = useNavigate()

  const DEMO_EMAIL = 'demo@demo.com'
  const DEMO_PASSWORD = 'demo123'

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD }
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoCredentials),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Erro no login demo' }))
        throw new Error(err.detail || 'Erro no login demo')
      }
      const data = await response.json()
      const accessToken = data.token?.access_token || data.access_token
      await loginWithToken(accessToken, data.user)
      navigate('/dashboard')
    } catch (e: any) {
      message.error(e.message || 'Falha ao entrar como demo')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    form.setFieldsValue({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    })
    message.success('Credenciais do demo preenchidas! Clique em "Entrar no Sistema"')
  }

  const copyCredentials = async (text: string) => {
    // Prevenir múltiplos cliques simultâneos
    if (copying) {
      return
    }

    setCopying(true)
    
    try {
      // Usar método que não requer permissão explícita
      // Criar elemento textarea temporário
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '0'
      textArea.style.opacity = '0'
      textArea.setAttribute('readonly', '')
      textArea.setAttribute('aria-hidden', 'true')
      
      document.body.appendChild(textArea)
      
      // Selecionar e copiar
      textArea.select()
      textArea.setSelectionRange(0, text.length) // Para mobile
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        message.success('Copiado para a área de transferência!', 2)
      } else {
        // Se execCommand falhar, tentar Clipboard API como fallback
        if (navigator.clipboard && document.hasFocus()) {
          try {
            await navigator.clipboard.writeText(text)
            message.success('Copiado para a área de transferência!', 2)
          } catch (clipboardError) {
            console.error('Erro ao copiar:', clipboardError)
            message.warning('Não foi possível copiar automaticamente. O texto está selecionado para você copiar manualmente.')
            // Tentar selecionar o texto no campo visível
            const emailInput = document.querySelector('input[placeholder*="demo@demo.com"]') as HTMLInputElement
            if (emailInput && text === DEMO_EMAIL) {
              emailInput.focus()
              emailInput.select()
            }
          }
        } else {
          message.warning('Não foi possível copiar automaticamente. Tente selecionar e copiar manualmente.')
        }
      }
    } catch (error: any) {
      console.error('Erro ao copiar:', error)
      message.error('Não foi possível copiar. Tente selecionar e copiar manualmente.')
    } finally {
      // Resetar estado após um pequeno delay para evitar cliques rápidos
      setTimeout(() => {
        setCopying(false)
      }, 500)
    }
  }

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
        // Backend retorna: { user: {...}, token: { access_token: "...", ... } }
        const accessToken = data.token?.access_token || data.access_token
        await loginWithToken(accessToken, data.user)
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
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
      console.log('📦 Dados recebidos completos:', data)
      console.log('🔑 Estrutura do token:', data.token)
      console.log('👤 Dados do usuário:', data.user)
      
      // Validar estrutura da resposta
      if (!data.token || !data.token.access_token) {
        console.error('❌ Estrutura de resposta inválida:', data)
        throw new Error('Token não encontrado na resposta do servidor')
      }
      
      if (!data.user) {
        console.error('❌ Dados do usuário não encontrados:', data)
        throw new Error('Dados do usuário não encontrados')
      }
      
      // Extrair o token correto
      const accessToken = data.token.access_token
      console.log('✅ Token extraído:', accessToken.substring(0, 20) + '...')
      
      // Salvar usando o formato correto
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Verificar se foi salvo
      const savedToken = localStorage.getItem('token')
      console.log('💾 Token salvo no localStorage:', savedToken?.substring(0, 20) + '...')
      console.log('💾 Usuário salvo no localStorage:', localStorage.getItem('user') ? 'SIM' : 'NÃO')
      
      if (!savedToken || savedToken === 'undefined') {
        console.error('❌ Erro ao salvar token')
        throw new Error('Erro ao salvar credenciais')
      }
      
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
          <Text type="secondary" style={{ marginBottom: 16 }}>
            {loading ? 'Login automático em andamento...' : 'Acesse sua conta'}
          </Text>

          {/* Credenciais Demo Mobile */}
          {!loading && (
            <Alert
              message="🧪 Demo: demo@demo.com / demo123"
              type="info"
              showIcon
              style={{ marginBottom: 16, fontSize: 12 }}
              action={
                <Button
                  size="small"
                  type="text"
                  onClick={() => {
                    mobileForm.setFieldsValue({
                      email: DEMO_EMAIL,
                      password: DEMO_PASSWORD
                    })
                    message.success('Credenciais preenchidas!')
                  }}
                >
                  Preencher
                </Button>
              }
            />
          )}
          
          {loading ? (
            <Button type="primary" loading={true} size="large" block>
              Conectando...
            </Button>
          ) : (
            <>
              <Form
                form={mobileForm}
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
                    placeholder={`Email (ex: ${DEMO_EMAIL})`}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Por favor, digite sua senha!' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder={`Senha (ex: ${DEMO_PASSWORD})`}
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
              <Button 
                onClick={handleDemoLogin}
                disabled={loading}
                type="default"
                icon={<LoginOutlined />}
                size="large"
                block
                style={{ marginTop: 8 }}
              >
                Login Demo Rápido
              </Button>
            </>
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

        {/* Card de Credenciais Demo */}
        <Alert
          message="🧪 Conta Demo para Testes"
          description={
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>Email: </Text>
                  <Text code style={{ fontSize: 13 }}>{DEMO_EMAIL}</Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyCredentials(DEMO_EMAIL)}
                    disabled={copying}
                    loading={copying}
                    style={{ marginLeft: 4 }}
                  />
                </div>
                <div>
                  <Text strong>Senha: </Text>
                  <Text code style={{ fontSize: 13 }}>{DEMO_PASSWORD}</Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyCredentials(DEMO_PASSWORD)}
                    disabled={copying}
                    loading={copying}
                    style={{ marginLeft: 4 }}
                  />
                </div>
                <Button
                  type="dashed"
                  size="small"
                  icon={<LoginOutlined />}
                  onClick={fillDemoCredentials}
                  block
                  style={{ marginTop: 8 }}
                >
                  Preencher Credenciais Demo
                </Button>
              </Space>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
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
              placeholder={`Email (ex: ${DEMO_EMAIL})`}
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
              placeholder={`Senha (ex: ${DEMO_PASSWORD})`}
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
          
          <Form.Item>
            <Button 
              onClick={handleDemoLogin}
              disabled={loading}
              type="default"
              icon={<LoginOutlined />}
              style={{ 
                width: '100%',
                height: 40,
                borderColor: '#1890ff',
                color: '#1890ff'
              }}
            >
              Entrar como Demo (Login Rápido)
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button 
            size="small" 
            danger
            type="link"
            onClick={() => {
              console.log('🧹 Limpando localStorage e tokens antigos...')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.clear()
              message.success('Cache limpo! Faça login novamente.')
              setTimeout(() => window.location.reload(), 1000)
            }}
            style={{ fontSize: '11px' }}
          >
            🗑️ Limpar Cache
          </Button>
          <br />
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