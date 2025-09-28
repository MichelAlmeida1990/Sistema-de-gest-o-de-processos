import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Badge, Switch, theme, Drawer } from 'antd'
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
import { JustaCausaLogo } from '../JustaCausaLogo'
import { useAuth } from '../../hooks/useAuth'
import { useNotificationStore } from '../../store/notificationStore'
import { useMobile } from '../../hooks/useMobile'
import { MobileLayout } from './MobileLayout'
import { NativeMobileLayout } from './NativeMobileLayout'

const { Header, Sider, Content } = Layout
const { Text } = Typography
const { useToken } = theme

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useToken()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()
  const { mobile: isMobileDevice, loading: mobileLoading } = useMobile()

  // Ajustar layout para mobile
  useEffect(() => {
    if (isMobileDevice) {
      setCollapsed(true) // Sempre colapsado em mobile
    }
  }, [isMobileDevice])

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
      background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.85) 0%, rgba(100, 149, 237, 0.75) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
    },
    sider: {
      background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.85) 0%, rgba(100, 149, 237, 0.75) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
    },
    content: {
      background: '#F5F5F5',
      minHeight: '100vh'
    }
  }

  // Loading state para mobile
  if (mobileLoading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <div>Carregando...</div>
        </div>
      </Layout>
    )
  }

  // Usar layout mobile nativo (sem Ant Design)
  if (isMobileDevice) {
    return <NativeMobileLayout>{children}</NativeMobileLayout>
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      {!isMobileDevice && (
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
          <JustaCausaLogo 
            collapsed={collapsed} 
            darkMode={darkMode} 
            size={40} 
          />
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
            label: collapsed ? '' : item.label, // Remove texto quando colapsado
            style: {
              margin: collapsed ? '2px 0' : '4px 0',
              borderRadius: collapsed ? '10px' : '12px',
              height: collapsed ? '44px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // Sempre centralizado quando colapsado
              fontWeight: '500',
              transition: 'all 0.3s ease',
              background: location.pathname === item.key 
                ? darkMode 
                  ? 'rgba(25, 25, 112, 0.4)'
                  : 'rgba(25, 25, 112, 0.3)'
                : 'transparent',
              color: location.pathname === item.key
                ? '#191970'
                : darkMode ? '#ffffff' : '#666666',
              padding: '0',
              width: collapsed ? '44px' : 'auto',
              minWidth: collapsed ? '44px' : 'auto',
              maxWidth: collapsed ? '44px' : 'none',
              boxShadow: location.pathname === item.key && collapsed
                ? darkMode 
                  ? '0 4px 12px rgba(0, 175, 238, 0.3)'
                  : '0 4px 12px rgba(0, 175, 238, 0.2)'
                : 'none',
              overflow: 'hidden' // Garante que nada vaze
            }
          }))}
        />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <JustaCausaLogo 
              collapsed={false} 
              darkMode={darkMode} 
              size={40} 
            />
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
        style={{
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.9) 0%, rgba(100, 149, 237, 0.8) 100%)'
        }}
        bodyStyle={{
          padding: 0,
          background: 'transparent'
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={(e) => {
            handleMenuClick(e)
            setMobileDrawerVisible(false)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '16px 8px'
          }}
          items={menuItems.map(item => ({
            ...item,
            style: {
              margin: '4px 0',
              borderRadius: '12px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              background: location.pathname === item.key 
                ? 'rgba(25, 25, 112, 0.6)'
                : 'transparent',
              color: darkMode ? '#ffffff' : '#ffffff',
              padding: '12px 16px',
              width: '100%',
              minWidth: 'auto',
              boxShadow: location.pathname === item.key 
                ? (darkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(255, 255, 255, 0.2)')
                : 'none',
              overflow: 'hidden'
            }
          }))}
        />
      </Drawer>

      <Layout style={{ 
        marginLeft: isMobileDevice ? 0 : (collapsed ? 80 : 280), 
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}>
        <Header style={{
          padding: isMobileDevice ? '0 16px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: isMobileDevice ? 'static' : 'fixed',
          top: isMobileDevice ? 'auto' : 0,
          left: isMobileDevice ? 'auto' : (collapsed ? 80 : 280),
          right: 0,
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.85) 0%, rgba(100, 149, 237, 0.75) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}>
          <Space>
            <Button
              type="text"
              icon={isMobileDevice ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => {
                if (isMobileDevice) {
                  setMobileDrawerVisible(true)
                } else {
                  setCollapsed(!collapsed)
                }
              }}
              style={{
                color: darkMode ? '#ffffff' : '#191970',
                fontSize: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
              }}
            />
            
            {/* Título do sistema em mobile */}
            {isMobileDevice && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '12px'
              }}>
                <Text style={{
                  color: darkMode ? '#ffffff' : '#031f5f',
                  fontSize: '18px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px'
                }}>
                  Gestor Jurídico
                </Text>
              </div>
            )}
            
            {/* Search Bar - Hidden on mobile */}
            {!isMobileDevice && (
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
            )}
          </Space>

          <Space size="small" style={{ gap: '8px' }}>
            {/* Dark Mode Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              minWidth: '80px',
              justifyContent: 'center'
            }}>
              {darkMode ? <BulbFilled style={{ color: '#ffd700' }} /> : <BulbOutlined />}
              <Switch 
                checked={darkMode} 
                onChange={setDarkMode}
                size="small"
                style={{ background: darkMode ? '#191970' : '#ccc' }}
              />
            </div>

            {/* Test Notifications Button */}
            <div style={{ minWidth: '40px' }}>
              <NotificationTestButton />
            </div>

            {/* Notifications */}
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotificationVisible(true)}
                style={{
                  color: '#191970',
                  fontSize: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
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
                gap: '8px',
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                minWidth: '100px'
              }}>
                <Avatar 
                  icon={<UserOutlined />}
                  size={24}
                  style={{ border: '2px solid #191970' }}
                >
                  {user?.full_name?.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ textAlign: 'left', minWidth: '80px' }}>
                  <Text style={{ 
                    color: '#191970',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'block',
                    lineHeight: '1.2'
                  }}>
                    {user?.full_name || 'Usuário'}
                  </Text>
                  <Text style={{ 
                    color: '#191970',
                    fontSize: '9px',
                    display: 'block',
                    lineHeight: '1.2'
                  }}>
                    {user?.role === 'admin' ? 'Admin' : 
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
          marginTop: isMobileDevice ? '0px' : '64px',
          padding: isMobileDevice ? '16px' : '24px',
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