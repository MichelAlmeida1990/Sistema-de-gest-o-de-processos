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
      gap: collapsed ? '0' : '12px',
      transition: 'all 0.3s ease'
    }}>
      {/* Logo Icon */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #60a5fa)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)'
      }}
      >
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          animation: 'shimmer 2s infinite'
        }} />
        
        {/* Scale Icon */}
        <svg 
          width={size * 0.6} 
          height={size * 0.6} 
          viewBox="0 0 24 24" 
          fill="none"
          style={{
            color: 'white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            zIndex: 1
          }}
        >
          {/* Scale Base */}
          <path 
            d="M3 21h18v2H3v-2z" 
            fill="currentColor"
          />
          {/* Scale Arm */}
          <path 
            d="M12 3v15" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Left Scale */}
          <path 
            d="M6 8l-3 3 3 3" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Right Scale */}
          <path 
            d="M18 8l3 3-3 3" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Justice Symbol */}
          <circle 
            cx="12" 
            cy="12" 
            r="2" 
            fill="currentColor"
          />
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
            color: darkMode ? '#ffffff' : '#1e3a8a',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Justa
            <span style={{
              color: '#10b981',
              fontSize: '16px',
              animation: 'pulse 2s infinite'
            }}>
              •
            </span>
            Causa
          </div>
          <div style={{
            color: darkMode ? '#cccccc' : '#6b7280',
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Sistema Jurídico
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default JustaCausaLogo
