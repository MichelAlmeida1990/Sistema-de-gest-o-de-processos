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
import { isMobile } from '../../utils/mobile'

const { Header, Sider, Content } = Layout
const { Text } = Typography
const { useToken } = theme

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useToken()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()

  // Detectar mobile e ajustar layout
  useEffect(() => {
    const checkMobile = () => {
      const mobile = isMobile()
      setIsMobileDevice(mobile)
      if (mobile) {
        setCollapsed(true) // Sempre colapsado em mobile
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
                  ? 'rgba(0, 175, 238, 0.25)'
                  : 'rgba(0, 175, 238, 0.15)'
                : 'transparent',
              color: location.pathname === item.key
                ? '#00afee'
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
          background: darkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
                ? (darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)')
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
          ...gradientStyles.header,
          padding: isMobileDevice ? '0 16px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: isMobileDevice ? 0 : (collapsed ? 80 : 280),
          right: 0,
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

            {/* Test Notifications Button */}
            <NotificationTestButton />

            {/* Notifications */}
            <Badge count={unreadCount} size="small">
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