import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Badge } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  SendOutlined,
  DollarOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { NotificationCenter } from '../NotificationCenter'
import { useNotificationSimulator } from '../../hooks/useNotificationSimulator'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/processes',
      icon: <FileTextOutlined />,
      label: 'Processos',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tarefas',
    },
    {
      key: '/deliveries',
      icon: <SendOutlined />,
      label: 'Entregas',
    },
    {
      key: '/financial',
      icon: <DollarOutlined />,
      label: 'Financeiro',
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Administração',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ]

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrador',
      manager: 'Gerente',
      user: 'Usuário',
      partner: 'Parceiro'
    }
    return roleMap[role] || role
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #031f5f 0%, #1e3a8a 100%)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        width={280}
        collapsedWidth={80}
      >
        {/* Logo */}
        <div 
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            margin: '0 16px'
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #00afee 0%, #ca00ca 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DashboardOutlined style={{ color: 'white', fontSize: '16px' }} />
              </div>
              <div>
                <Text style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                  Gestão Processos
                </Text>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px' }}>
                  Sistema Integrado
                </div>
              </div>
            </div>
          ) : (
            <div 
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #00afee 0%, #ca00ca 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DashboardOutlined style={{ color: 'white', fontSize: '16px' }} />
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: '16px'
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header 
          style={{
            background: 'white',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 999
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                borderRadius: '8px',
                border: '1px solid #e8e8e8',
                background: '#fafafa'
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SearchOutlined style={{ color: '#999', fontSize: '16px' }} />
              <Text style={{ color: '#666', fontSize: '14px' }}>
                Buscar processos, tarefas...
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                  minWidth: collapsed ? 'auto' : '200px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa'
                }}
              >
                <Avatar
                  size={36}
                  style={{
                    background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                    flexShrink: 0
                  }}
                  icon={<UserOutlined />}
                />
                {!collapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#333', 
                      fontSize: '14px',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user?.name || 'Usuário Teste'}
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: '12px',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {getRoleDisplayName(user?.role || 'admin')}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}