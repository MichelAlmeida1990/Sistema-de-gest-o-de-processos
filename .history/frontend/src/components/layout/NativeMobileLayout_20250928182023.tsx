// ===========================================
// LAYOUT MOBILE NATIVO - SEM ANT DESIGN
// ===========================================

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { JustaCausaLogo } from '../JustaCausaLogo'
import { useAuth } from '../../hooks/useAuth'
import { useNotificationStore } from '../../store/notificationStore'

interface NativeMobileLayoutProps {
  children: React.ReactNode
}

export const NativeMobileLayout: React.FC<NativeMobileLayoutProps> = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 480)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    // Layout mobile nativo carregado
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const menuItems = [
    { key: '/dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { key: '/processes', icon: '📋', label: 'Processos', path: '/processes' },
    { key: '/tasks', icon: '✅', label: 'Tarefas', path: '/tasks' },
    { key: '/deliveries', icon: '📤', label: 'Entregas', path: '/deliveries' },
    { key: '/financial', icon: '💰', label: 'Financeiro', path: '/financial' },
    { key: '/reports', icon: '📈', label: 'Relatórios', path: '/reports' },
    { key: '/timeline', icon: '⏰', label: 'Timeline', path: '/timeline' },
    { key: '/files', icon: '📁', label: 'Arquivos', path: '/files' }
  ]

  const handleMenuClick = (path: string) => {
    navigate(path)
    setDrawerVisible(false)
  }

  const handleLogout = () => {
    logout()
    setDrawerVisible(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: darkMode ? '#000000' : '#F5F5F5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header Mobile Nativo */}
      <header className="native-mobile-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '56px',
        background: 'linear-gradient(135deg, #000000 0%, #2C2C2C 50%, #C0C0C0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setDrawerVisible(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '18px'
            }}
          >
            ☰
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <JustaCausaLogo 
              collapsed={false} 
              darkMode={false} 
              size={32} 
            />
            <div className="mobile-marquee" style={{
              maxWidth: isSmallScreen ? '120px' : '160px',
            }}>
              <div className="mobile-marquee-text" style={{
                color: '#ffffff',
                fontSize: isSmallScreen ? '16px' : '18px',
                fontWeight: '700',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                minWidth: '300px'
              }}>
                🏛️ Sistema Jurídico • ⚖️ Gestão de Processos • 📱 Advocacia Digital • 🚀 Justiça Eficiente • 🏛️ Sistema Jurídico
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ff4d4f',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '600',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px'
              }}>
                {unreadCount}
              </div>
            )}
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                fontSize: '16px'
              }}
            >
              🔔
            </button>
          </div>

          {/* User Avatar */}
          <div
            onClick={() => setDrawerVisible(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* Drawer Mobile Nativo */}
      {drawerVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1001,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex'
        }}>
          <div style={{
            width: '280px',
            height: '100%',
            background: 'linear-gradient(135deg, #000000 0%, #2C2C2C 50%, #C0C0C0 100%)',
            padding: '20px 0',
            overflowY: 'auto'
          }}>
            {/* Drawer Header */}
            <div style={{ 
              textAlign: 'center', 
              padding: '0 20px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '20px'
            }}>
              <JustaCausaLogo 
                collapsed={false} 
                darkMode={false} 
                size={44} 
              />
              <div style={{ 
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: '700',
                marginTop: '8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}>
                Sistema Jurídico
              </div>
            </div>

            {/* Drawer Menu */}
            <div style={{ padding: '0 16px' }}>
              {menuItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.path)}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: location.pathname === item.key 
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: location.pathname === item.key ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0 16px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Drawer Footer */}
            <div style={{ 
              padding: '20px 16px 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              marginTop: '20px'
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0 16px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '20px' }}>🚪</span>
                Sair
              </button>
            </div>
          </div>
          
          {/* Overlay para fechar */}
          <div 
            onClick={() => setDrawerVisible(false)}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Content */}
      <main style={{
        marginTop: '56px',
        padding: '16px',
        minHeight: 'calc(100vh - 56px)',
        background: darkMode ? '#1a1a2e' : '#f5f7fa'
      }}>
        {children}
      </main>
    </div>
  )
}
