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
      
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .login-container {
          width: 100%;
          max-width: 400px;
        }
        
        .login-card {
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-xl);
          border: none;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .login-title {
          color: var(--color-primary);
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .login-subtitle {
          color: var(--color-gray-600);
          font-size: var(--font-size-base);
        }
        
        .login-form {
          margin-top: 24px;
        }
        
        .login-form .ant-form-item {
          margin-bottom: 20px;
        }
        
        .login-form .ant-input-affix-wrapper {
          border-radius: var(--border-radius-base);
          border: 2px solid var(--color-gray-200);
          transition: all var(--transition-fast);
        }
        
        .login-form .ant-input-affix-wrapper:hover {
          border-color: var(--color-primary);
        }
        
        .login-form .ant-input-affix-wrapper-focused {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(3, 31, 95, 0.1);
        }
        
        .login-button {
          height: 48px;
          border-radius: var(--border-radius-base);
          font-weight: 600;
          font-size: var(--font-size-base);
          background: var(--color-primary);
          border-color: var(--color-primary);
          transition: all var(--transition-fast);
        }
        
        .login-button:hover {
          background: var(--color-primary-light);
          border-color: var(--color-primary-light);
          transform: translateY(-1px);
          box-shadow: var(--shadow-lg);
        }
        
        .login-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--color-gray-200);
        }
        
        .login-help {
          font-size: var(--font-size-sm);
        }
        
        @media (max-width: 480px) {
          .login-page {
            padding: 16px;
          }
          
          .login-title {
            font-size: var(--font-size-2xl);
          }
        }
      `}</style>
    </div>
  )
}

