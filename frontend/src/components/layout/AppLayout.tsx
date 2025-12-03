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
  ApiOutlined,
  BulbOutlined,
  BulbFilled,
  FileSearchOutlined,
  TeamOutlined,
  ToolOutlined,
  WalletOutlined
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

  // Função auxiliar para criar item de menu
  const createMenuItem = (key: string, icon: React.ReactNode, label: string, path: string) => ({
    key,
    icon,
    label,
    path
  })

  // Função auxiliar para criar submenu
  const createSubMenu = (key: string, icon: React.ReactNode, label: string, children: any[]) => ({
    key,
    icon,
    label,
    children
  })

  const menuItems = [
    // PRINCIPAL - Itens mais usados (sempre visíveis)
    createMenuItem('/dashboard', <DashboardOutlined />, 'Dashboard', '/dashboard'),
    createMenuItem('/processes', <FileTextOutlined />, 'Processos', '/processes'),
    createMenuItem('/tasks', <CheckSquareOutlined />, 'Tarefas', '/tasks'),
    
    // GESTÃO DE TRABALHO - Submenu
    createSubMenu('work-management', <TeamOutlined />, 'Gestão de Trabalho', [
      createMenuItem('/kanban', <AppstoreOutlined />, 'Kanban', '/kanban'),
      createMenuItem('/timeline', <ClockCircleOutlined />, 'Timeline', '/timeline'),
      createMenuItem('/files', <FolderOutlined />, 'Arquivos', '/files'),
      createMenuItem('/deliveries', <SendOutlined />, 'Entregas', '/deliveries')
    ]),
    
    // ANÁLISE E RELATÓRIOS - Submenu
    createSubMenu('analysis', <BarChartOutlined />, 'Análise e Relatórios', [
      createMenuItem('/reports', <BarChartOutlined />, 'Relatórios', '/reports'),
      createMenuItem('/funnel', <BarChartOutlined />, 'Funil de Processos', '/funnel'),
      createMenuItem('/search', <SearchOutlined />, 'Busca', '/search')
    ]),
    
    // FERRAMENTAS JURÍDICAS - Submenu
    createSubMenu('legal-tools', <ToolOutlined />, 'Ferramentas Jurídicas', [
      createMenuItem('/deadline-calculator', <ClockCircleOutlined />, 'Calculadora de Prazos', '/deadline-calculator'),
      createMenuItem('/legal-diagnosis', <FileSearchOutlined />, 'Diagnóstico Jurídico', '/legal-diagnosis'),
      createMenuItem('/jurisprudence', <FileSearchOutlined />, 'Assistente de Jurisprudência', '/jurisprudence')
    ]),
    
    // FINANCEIRO - Submenu
    createSubMenu('financial', <WalletOutlined />, 'Financeiro', [
      createMenuItem('/financial', <DollarOutlined />, 'Financeiro', '/financial'),
      createMenuItem('/precatorios', <DollarOutlined />, 'Precatórios', '/precatorios')
    ]),
    
    // INTEGRAÇÕES - Submenu
    createSubMenu('integrations', <ApiOutlined />, 'Integrações', [
      createMenuItem('/rdstation', <ApiOutlined />, 'RD Station', '/rdstation')
    ]),
    
    // SISTEMA - Submenu
    createSubMenu('system', <SettingOutlined />, 'Sistema', [
      createMenuItem('/notifications', <BellOutlined />, 'Notificações', '/notifications'),
      createMenuItem('/admin', <SettingOutlined />, 'Admin', '/admin')
    ])
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

  // Função recursiva para encontrar item em submenus
  const findMenuItem = (items: any[], key: string): any => {
    for (const item of items) {
      if (item.key === key) {
        return item
      }
      if (item.children) {
        const found = findMenuItem(item.children, key)
        if (found) return found
      }
    }
    return null
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = findMenuItem(menuItems, key)
    if (item && item.path) {
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
      background: 'linear-gradient(135deg, rgba(15, 15, 80, 0.9) 0%, rgba(2, 20, 60, 0.8) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
    },
    sider: {
      background: 'linear-gradient(135deg, rgba(15, 15, 80, 0.95) 0%, rgba(2, 20, 60, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
    },
    content: {
      background: 'transparent',
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

        {/* Menu com Scroll Personalizado */}
        <div style={{
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '8px 4px' : '16px 8px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(25, 25, 112, 0.3) transparent'
        }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              overflow: 'visible',
              fontSize: '15px'
            }}
            items={menuItems.map(item => {
              // Se tem children, é um submenu
              if (item.children) {
                return {
                  ...item,
                  label: collapsed ? '' : item.label,
                  children: item.children.map((child: any) => ({
                    ...child,
                    label: collapsed ? '' : child.label,
                    style: {
                      margin: collapsed ? '2px 0' : '4px 0',
                      borderRadius: collapsed ? '10px' : '12px',
                      height: collapsed ? '44px' : '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    fontWeight: '500',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: location.pathname === child.key 
                      ? darkMode 
                        ? 'rgba(25, 25, 112, 0.4)'
                        : 'rgba(25, 25, 112, 0.3)'
                      : 'transparent',
                    color: location.pathname === child.key
                      ? '#191970'
                      : darkMode ? '#ffffff' : '#666666',
                    padding: '0',
                      width: collapsed ? '44px' : 'auto',
                      minWidth: collapsed ? '44px' : 'auto',
                      maxWidth: collapsed ? '44px' : 'none',
                      boxShadow: location.pathname === child.key && collapsed
                        ? darkMode 
                          ? '0 4px 12px rgba(0, 175, 238, 0.3)'
                          : '0 4px 12px rgba(0, 175, 238, 0.2)'
                        : 'none',
                      overflow: 'hidden'
                    }
                  }))
                }
              }
              // Item normal (sem submenu)
              return {
                ...item,
                label: collapsed ? '' : item.label,
                style: {
                  margin: collapsed ? '2px 0' : '4px 0',
                  borderRadius: collapsed ? '10px' : '12px',
                  height: collapsed ? '44px' : '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  fontSize: '15px',
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
                  overflow: 'hidden'
                }
              }
            })}
          />
        </div>
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
          background: 'linear-gradient(135deg, rgba(15, 15, 80, 0.95) 0%, rgba(2, 20, 60, 0.9) 100%)'
        }}
        styles={{
          body: {
            padding: 0,
            background: 'transparent'
          }
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
            padding: '16px 8px',
            fontSize: '15px'
          }}
          items={menuItems.map(item => {
            // Se tem children, é um submenu
            if (item.children) {
              return {
                ...item,
                children: item.children.map((child: any) => ({
                  ...child,
                  style: {
                    margin: '4px 0',
                    borderRadius: '12px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '500',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: location.pathname === child.key 
                      ? 'rgba(25, 25, 112, 0.6)'
                      : 'transparent',
                    color: '#ffffff',
                    padding: '12px 16px',
                    width: '100%',
                    minWidth: 'auto',
                    boxShadow: location.pathname === child.key 
                      ? '0 4px 12px rgba(255, 255, 255, 0.2)'
                      : 'none',
                    overflow: 'hidden'
                  }
                }))
              }
            }
            // Item normal
            return {
              ...item,
              style: {
                margin: '4px 0',
                borderRadius: '12px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: '500',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                background: location.pathname === item.key 
                  ? 'rgba(25, 25, 112, 0.6)'
                  : 'transparent',
                color: '#ffffff',
                padding: '12px 16px',
                width: '100%',
                minWidth: 'auto',
                boxShadow: location.pathname === item.key 
                  ? '0 4px 12px rgba(255, 255, 255, 0.2)'
                  : 'none',
                overflow: 'hidden'
              }
            }
          })}
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
          background: 'linear-gradient(135deg, rgba(15, 15, 80, 0.9) 0%, rgba(2, 20, 60, 0.8) 100%)',
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