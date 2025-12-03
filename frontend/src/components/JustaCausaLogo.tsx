import React from 'react'

interface JustaCausaLogoProps {
  collapsed?: boolean
  darkMode?: boolean
  size?: number
}

export const JustaCausaLogo: React.FC<JustaCausaLogoProps> = ({ 
  collapsed = false, 
  darkMode = false, 
  size = 40 
}) => {
  // Usar logo sem fundo para melhor integração
  const logoPath = '/logo-sem-fundo.jpg'
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: collapsed ? '0' : '16px',
      transition: 'all 0.3s ease',
      width: collapsed ? '100%' : 'auto',
      height: collapsed ? '60px' : 'auto'
    }}>
      {/* Logo Image com fundo branco */}
      <div style={{
        width: collapsed ? `${size}px` : 'auto',
        height: collapsed ? `${size}px` : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        background: '#ffffff',
        borderRadius: collapsed ? '8px' : '12px',
        padding: collapsed ? '4px' : '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      >
        <img
          src={logoPath}
          alt="Gestor Jurídico"
          style={{
            width: collapsed ? `${size - 8}px` : '120px',
            height: collapsed ? `${size - 8}px` : 'auto',
            objectFit: 'contain',
            transition: 'all 0.3s ease'
          }}
        />
      </div>

      {/* Logo Text - Apenas quando não colapsado */}
      {!collapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.5px',
            color: darkMode ? '#ffffff' : '#191970',
            lineHeight: '1.2'
          }}>
            Gestor Jurídico
          </div>
          <div style={{
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(25, 25, 112, 0.7)',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            opacity: 0.8
          }}>
            Sistema Jurídico
          </div>
        </div>
      )}
    </div>
  )
}

export default JustaCausaLogo