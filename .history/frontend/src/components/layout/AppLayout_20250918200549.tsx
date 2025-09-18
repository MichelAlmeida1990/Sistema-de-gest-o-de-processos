import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Badge, Switch, theme } from 'antd'
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
  BellOutlined,
  SearchOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  BarChartOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { NotificationCenter } from '../NotificationCenter'
import { NotificationTestButton } from '../NotificationTestButton'
import { useAuth } from '../../hooks/useAuth'

const { Header, Sider, Content } = Layout
const { Text } = Typography
const { useToken } = theme

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useToken()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      key: '/processes',
      icon: <FileTextOutlined />,
      label: 'Processos',
      path: '/processes'
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tarefas',
      path: '/tasks'
    },
    {
      key: '/kanban',
      icon: <AppstoreOutlined />,
      label: 'Kanban',
      path: '/kanban'
    },
    {
      key: '/timeline',
      icon: <ClockCircleOutlined />,
      label: 'Timeline',
      path: '/timeline'
    },
    {
      key: '/files',
      icon: <FolderOutlined />,
      label: 'Arquivos',
      path: '/files'
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Relatórios',
      path: '/reports'
    },
    {
      key: '/deliveries',
      icon: <SendOutlined />,
      label: 'Entregas',
      path: '/deliveries'
    },
    {
      key: '/financial',
      icon: <DollarOutlined />,
      label: 'Financeiro',
      path: '/financial'
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Admin',
      path: '/admin'
    }
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
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
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find(item => item.key === key)
    if (item) {
      navigate(item.path)
    }
  }

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        // Navigate to profile
        break
      case 'settings':
        // Navigate to settings
        break
      case 'logout':
        logout()
        break
    }
  }

  const gradientStyles = {
    header: {
      background: darkMode 
        ? 'rgba(3, 31, 95, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: darkMode 
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: darkMode
        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    sider: {
      background: darkMode 
        ? 'rgba(26, 26, 46, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: darkMode 
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: darkMode
        ? '4px 0 32px rgba(0, 0, 0, 0.3)'
        : '4px 0 32px rgba(0, 0, 0, 0.1)'
    },
    content: {
      background: darkMode 
        ? 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        style={{
          ...gradientStyles.sider,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '16px 8px' : '24px 16px',
          textAlign: 'center',
          borderBottom: darkMode 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.06)',
          minHeight: collapsed ? '60px' : 'auto'
        }}>
          {!collapsed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #031f5f, #00afee)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0, 175, 238, 0.3)'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: 'bold' 
                }}>
                  J
                </span>
              </div>
              <div>
                <Text style={{ 
                  color: darkMode ? '#ffffff' : '#031f5f',
                  fontSize: '18px',
                  fontWeight: '700',
                  display: 'block'
                }}>
                  JurisAI
                </Text>
                <Text style={{ 
                  color: darkMode ? '#cccccc' : '#666666',
                  fontSize: '12px',
                  display: 'block'
                }}>
                  Sistema Jurídico
                </Text>
              </div>
            </div>
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #031f5f, #00afee)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 8px 24px rgba(0, 175, 238, 0.3)'
            }}>
              <span style={{ 
                color: 'white', 
                fontSize: '20px', 
                fontWeight: 'bold' 
              }}>
                J
              </span>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            padding: collapsed ? '8px 4px' : '16px 8px',
            overflow: 'hidden'
          }}
          items={menuItems.map(item => ({
            ...item,
            style: {
              margin: collapsed ? '2px 0' : '4px 0',
              borderRadius: collapsed ? '8px' : '12px',
              height: collapsed ? '40px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              background: location.pathname === item.key 
                ? darkMode 
                  ? 'rgba(0, 175, 238, 0.2)'
                  : 'rgba(0, 175, 238, 0.1)'
                : 'transparent',
              color: location.pathname === item.key
                ? '#00afee'
                : darkMode ? '#ffffff' : '#666666',
              padding: collapsed ? '0' : '0 16px'
            }
          }))}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <Header style={{
          ...gradientStyles.header,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: collapsed ? 80 : 280,
          right: 0,
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                color: darkMode ? '#ffffff' : '#031f5f',
                fontSize: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            />
            
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              width: '300px',
              minWidth: '200px'
            }}>
              <input
                type="text"
                placeholder="Buscar processos, tarefas..."
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 16px 0 40px',
                  background: darkMode 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '20px',
                  color: darkMode ? '#ffffff' : '#000000',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = darkMode 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.08)'
                }}
                onBlur={(e) => {
                  e.target.style.background = darkMode 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)'
                }}
              />
              <SearchOutlined style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#cccccc' : '#999999'
              }} />
            </div>
          </Space>

          <Space size="middle">
            {/* Dark Mode Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.04)',
              borderRadius: '20px',
              border: darkMode 
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              {darkMode ? <BulbFilled style={{ color: '#ffd700' }} /> : <BulbOutlined />}
              <Switch 
                checked={darkMode} 
                onChange={setDarkMode}
                size="small"
                style={{ background: darkMode ? '#00afee' : '#ccc' }}
              />
            </div>

            {/* Notifications */}
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotificationVisible(true)}
                style={{
                  color: darkMode ? '#ffffff' : '#031f5f',
                  fontSize: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
            </Badge>

            {/* User Menu */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
                style: {
                  background: darkMode ? '#1a1a2e' : '#ffffff',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  boxShadow: darkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)'
                }
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                background: darkMode 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.04)',
                borderRadius: '20px',
                border: darkMode 
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <Avatar 
                  icon={<UserOutlined />}
                  size={32}
                  style={{ border: '2px solid #00afee' }}
                >
                  {user?.full_name?.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ textAlign: 'left' }}>
                  <Text style={{ 
                    color: darkMode ? '#ffffff' : '#000000',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block'
                  }}>
                    {user?.full_name || 'Usuário'}
                  </Text>
                  <Text style={{ 
                    color: darkMode ? '#cccccc' : '#666666',
                    fontSize: '12px',
                    display: 'block'
                  }}>
                    {user?.role === 'admin' ? 'Administrador' : 
                     user?.role === 'lawyer' ? 'Advogado' : 
                     user?.role === 'assistant' ? 'Assistente' : 'Cliente'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          ...gradientStyles.content,
          marginTop: '64px',
          padding: '24px',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>

      {/* Notification Center */}
      <NotificationCenter 
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </Layout>
  )
}