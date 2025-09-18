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

      <style jsx>{`
        .app-layout {
          min-height: 100vh;
        }
        
        .app-sider {
          background: var(--color-white);
          border-right: 1px solid var(--color-gray-200);
          box-shadow: var(--shadow-base);
        }
        
        .logo {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--color-gray-200);
          background: var(--color-primary);
          color: var(--color-white);
        }
        
        .logo-text {
          color: var(--color-white) !important;
          font-weight: 600;
          font-size: var(--font-size-lg);
        }
        
        .app-menu {
          border: none;
          background: transparent;
        }
        
        .app-menu .ant-menu-item {
          margin: 4px 8px;
          border-radius: var(--border-radius-base);
          height: 48px;
          line-height: 48px;
        }
        
        .app-menu .ant-menu-item-selected {
          background: var(--color-primary) !important;
          color: var(--color-white) !important;
        }
        
        .app-menu .ant-menu-item-selected .ant-menu-item-icon {
          color: var(--color-white) !important;
        }
        
        .app-menu .ant-menu-item:hover {
          background: var(--color-gray-100);
        }
        
        .app-header {
          background: var(--color-white);
          border-bottom: 1px solid var(--color-gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: var(--shadow-sm);
        }
        
        .header-left {
          display: flex;
          align-items: center;
        }
        
        .collapse-button {
          font-size: 16px;
          color: var(--color-gray-600);
        }
        
        .collapse-button:hover {
          color: var(--color-primary);
          background: var(--color-gray-100);
        }
        
        .header-right {
          display: flex;
          align-items: center;
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: var(--border-radius-base);
          transition: all var(--transition-fast);
        }
        
        .user-menu:hover {
          background: var(--color-gray-100);
        }
        
        .user-avatar {
          margin-right: 8px;
          background: var(--color-primary);
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .user-name {
          font-weight: 500;
          color: var(--color-gray-800);
          line-height: 1.2;
        }
        
        .user-role {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          line-height: 1.2;
          text-transform: capitalize;
        }
        
        .app-content {
          background: var(--color-gray-50);
          min-height: calc(100vh - 64px);
        }
        
        @media (max-width: 768px) {
          .app-sider {
            position: fixed;
            z-index: 1000;
            height: 100vh;
          }
          
          .app-header {
            padding: 0 16px;
          }
          
          .user-info {
            display: none;
          }
        }
      `}</style>
    </Layout>
  )
}
