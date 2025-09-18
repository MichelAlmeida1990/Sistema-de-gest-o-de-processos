import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

interface LoginForm {
  username: string
  password: string
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    
    try {
      // TODO: Implementar chamada real para API
      // Simulação de login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados fake para desenvolvimento
      const fakeUser = {
        id: 1,
        username: values.username,
        email: `${values.username}@example.com`,
        name: 'Usuário Teste',
        role: 'admin'
      }
      
      const fakeToken = 'fake-jwt-token'
      const fakeRefreshToken = 'fake-refresh-token'
      
      login(fakeToken, fakeRefreshToken, fakeUser)
      message.success('Login realizado com sucesso!')
      
    } catch (error) {
      message.error('Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2} className="login-title">
              Sistema de Gestão de Processos
            </Title>
            <Text className="login-subtitle">
              Faça login para acessar o sistema
            </Text>
          </div>
          
          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Por favor, informe seu usuário!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Usuário"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Por favor, informe sua senha!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Senha"
                autoComplete="current-password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
              >
                Entrar
              </Button>
            </Form.Item>
          </Form>
          
          <div className="login-footer">
            <Text type="secondary" className="login-help">
              Para desenvolvimento, use qualquer usuário/senha
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

