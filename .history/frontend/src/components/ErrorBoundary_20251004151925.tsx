import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button, Typography, Space } from 'antd'
import { BugOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ERROR BOUNDARY CAUGHT:', error)
    console.error('🚨 ERROR INFO:', errorInfo)
    
    // Salvar erro no localStorage para debug
    localStorage.setItem('last_error', JSON.stringify({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    }))
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#f5f5f5'
        }}>
          <Result
            status="error"
            icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
            title="Erro na Aplicação"
            subTitle="Algo deu errado. Vamos investigar!"
            extra={[
              <Button type="primary" onClick={this.handleReload} icon={<ReloadOutlined />}>
                Recarregar Página
              </Button>
            ]}
          >
            <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
              <Title level={4}>Detalhes do Erro:</Title>
              <Paragraph>
                <Text code>{this.state.error?.message}</Text>
              </Paragraph>
              
              {this.state.error?.stack && (
                <>
                  <Title level={5}>Stack Trace:</Title>
                  <pre style={{
                    background: '#f6f8fa',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <>
                  <Title level={5}>Component Stack:</Title>
                  <pre style={{
                    background: '#f6f8fa',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </Result>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary









