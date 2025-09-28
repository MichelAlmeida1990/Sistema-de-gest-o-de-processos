// ===========================================
// LAYOUT ESPECÍFICO PARA MOBILE
// ===========================================

import React, { useState } from 'react'
import { Layout, Drawer, Button, Typography, Space, Badge, Switch, Avatar, Dropdown } from 'antd'
import {
  MenuOutlined,
  BellOutlined,
  BulbOutlined,
  BulbFilled,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { JustaCausaLogo } from '../JustaCausaLogo'
import { useAuth } from '../../hooks/useAuth'
import { useNotificationStore } from '../../store/notificationStore'

const { Header, Content } = Layout
const { Text } = Typography

interface MobileLayoutProps {
  children: React.ReactNode
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()

  const menuItems = [
    {
      key: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      key: '/processes',
      icon: '📋',
      label: 'Processos',
      path: '/processes'
    },
    {
      key: '/tasks',
      icon: '✅',
      label: 'Tarefas',
      path: '/tasks'
    },
    {
      key: '/deliveries',
      icon: '📤',
      label: 'Entregas',
      path: '/deliveries'
    },
    {
      key: '/financial',
      icon: '💰',
      label: 'Financeiro',
      path: '/financial'
    },
    {
      key: '/reports',
      icon: '📈',
      label: 'Relatórios',
      path: '/reports'
    },
    {
      key: '/timeline',
      icon: '⏰',
      label: 'Timeline',
      path: '/timeline'
    },
    {
      key: '/files',
      icon: '📁',
      label: 'Arquivos',
      path: '/files'
    }
  ]

  const handleMenuClick = (e: any) => {
    const item = menuItems.find(item => item.key === e.key)
    if (item) {
      navigate(item.path)
      setDrawerVisible(false)
    }
  }

  const handleUserMenuClick = (e: any) => {
    switch (e.key) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        logout()
        break
      default:
        break
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair'
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: darkMode ? '#1a1a2e' : '#f5f7fa' }}>
      {/* Header Mobile */}
      <Header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '64px',
        padding: '0 16px',
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        lineHeight: '64px'
      }}>
        {/* Left Side */}
        <Space>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
              color: '#ffffff',
              fontSize: '20px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <JustaCausaLogo 
              collapsed={false} 
              darkMode={false} 
              size={32} 
            />
            <Text style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              marginLeft: '8px'
            }}>
              Gestor Jurídico
            </Text>
          </div>
        </Space>

        {/* Right Side */}
        <Space size="middle">
          {/* Dark Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px'
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
          <Badge count={unreadCount} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => setNotificationVisible(true)}
              style={{
                color: '#ffffff',
                fontSize: '18px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)'
            }}>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ 
                  background: '#00afee',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase()}
              </Avatar>
            </div>
          </Dropdown>
        </Space>
      </Header>

      {/* Drawer Mobile */}
      <Drawer
        title={
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <JustaCausaLogo 
              collapsed={false} 
              darkMode={darkMode} 
              size={40} 
            />
            <Text style={{ 
              display: 'block', 
              marginTop: '8px',
              color: darkMode ? '#ffffff' : '#333',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Gestor Jurídico
            </Text>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        bodyStyle={{
          padding: '16px',
          background: 'transparent'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {menuItems.map(item => (
            <Button
              key={item.key}
              type="text"
              onClick={() => handleMenuClick({ key: item.key })}
              style={{
                width: '100%',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '0 16px',
                background: location.pathname === item.key 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'transparent',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: location.pathname === item.key ? '600' : '400',
                borderRadius: '12px',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '20px', marginRight: '12px' }}>
                {item.icon}
              </span>
              {item.label}
            </Button>
          ))}
        </div>
      </Drawer>

      {/* Content */}
      <Content style={{
        marginTop: '64px',
        padding: '16px',
        minHeight: 'calc(100vh - 64px)',
        background: darkMode ? '#1a1a2e' : '#f5f7fa',
        paddingTop: '20px'
      }}>
        {children}
      </Content>
    </Layout>
  )
}
