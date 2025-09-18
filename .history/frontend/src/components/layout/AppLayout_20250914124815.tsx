import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from 'antd'
import { 
  DashboardOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  InboxOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

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
      icon: <CalculatorOutlined />,
      label: 'Tarefas',
    },
    {
      key: '/deliveries',
      icon: <InboxOutlined />,
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
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="app-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="app-sider"
      >
        <div className="logo">
          <Text className="logo-text">
            {collapsed ? 'GP' : 'Gestão Processos'}
          </Text>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="app-menu"
        />
      </Sider>
      
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-button"
            />
          </div>
          
          <div className="header-right">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-menu">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                <div className="user-info">
                  <Text className="user-name">{user?.name}</Text>
                  <Text className="user-role">{user?.role}</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="app-content">
          {children}
        </Content>
      </Layout>

    </Layout>
  )
}

