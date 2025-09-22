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
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: collapsed ? '0' : '16px',
      transition: 'all 0.3s ease',
      position: collapsed ? 'relative' : 'static',
      height: collapsed ? '60px' : 'auto'
    }}>
      {/* Logo Icon - Clean Design */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        background: darkMode 
          ? 'linear-gradient(135deg, #1e293b, #334155)'
          : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: darkMode 
          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(59, 130, 246, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        position: collapsed ? 'absolute' : 'static',
        top: collapsed ? '50%' : 'auto',
        left: collapsed ? '50%' : 'auto',
        transform: collapsed ? 'translate(-50%, -50%)' : 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 6px 20px rgba(0, 0, 0, 0.4)'
          : '0 6px 20px rgba(59, 130, 246, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(59, 130, 246, 0.3)'
      }}
      >
        {/* Justice Scale Icon */}
        <svg 
          width={size * 0.5} 
          height={size * 0.5} 
          viewBox="0 0 24 24" 
          fill="none"
          style={{
            color: 'white',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
          }}
        >
          {/* Scale Base */}
          <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor"/>
          {/* Central Column */}
          <rect x="11.5" y="4" width="1" height="16" fill="currentColor"/>
          {/* Left Scale */}
          <path 
            d="M6 8 L3 11 L6 14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          {/* Right Scale */}
          <path 
            d="M18 8 L21 11 L18 14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          {/* Central Balance Point */}
          <circle cx="12" cy="11" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      {/* Logo Text */}
      {!collapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: darkMode ? '#ffffff' : '#1e293b',
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            <span>Justa</span>
            <span style={{
              color: darkMode ? '#a78bfa' : '#8b5cf6',
              fontSize: '14px'
            }}>•</span>
            <span>Causa</span>
          </div>
          <div style={{
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '10px',
            fontWeight: '500',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Sistema Jurídico
          </div>
        </div>
      )}

      {/* Collapsed Logo - Just the icon with subtle text */}
      {collapsed && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          <div style={{
            fontSize: '8px',
            fontWeight: '600',
            color: darkMode ? '#a78bfa' : '#8b5cf6',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            opacity: 0.8
          }}>
            JC
          </div>
        </div>
      )}
    </div>
  )
}

export default JustaCausaLogo
